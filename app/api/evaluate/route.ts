import { NextResponse } from "next/server";
import { isPrdReview } from "../../lib/review-contract";

export const runtime = "edge";

type ReviewDepth = "light" | "standard" | "full" | "specialized";

const evaluatorPrompt = `You are a rigorous principal product reviewer. Evaluate a draft PRD for decision readiness, not prose quality.

Return ONLY valid JSON matching this shape:
{
  "classification": {"type": string, "reviewDepth": "light"|"standard"|"full"|"specialized", "reason": string},
  "readiness": "ready"|"ready_with_caveats"|"not_ready",
  "summary": string,
  "startHere": string,
  "dimensions": [
    {"name": string, "status": "looks_good"|"needs_review"|"critical_gap", "assessment": string}
  ],
  "findings": [
    {"priority": "critical"|"important"|"optimization", "title": string, "missing": string, "suggestedText": string, "evidenceNeeded": string}
  ],
  "openQuestions": [string],
  "decisionLedger": [
    {"decision": string, "whyItMatters": string, "currentAssumption": string, "evidenceNeeded": string, "suggestedOwner": "product"|"design"|"engineering"|"data"|"legal_policy"|"cross_functional"}
  ]
}

Use these review dimensions:
1. Opportunity & hypothesis
2. Product scope & decision clarity
3. User experience & segment/edge-case impact
4. Metrics, data rigor & guardrails
5. Dependencies & adjacent-system impact
6. Risks, rollout & operational readiness

Calibrate review depth:
- light: UX parity, copy, discoverability, or low-risk presentation changes
- standard: incremental workflow changes or internal tooling migrations
- full: net-new capabilities or material behavior changes
- specialized: pricing, policy, marketplace, safety, security, privacy, compliance, or other high-consequence changes

Rules:
- Never invent research, baselines, experiments, dependencies, or company context.
- Distinguish missing evidence from a bad decision.
- Prefer a few high-signal findings over exhaustive criticism.
- A critical gap in fundamentals should prevent a "ready" result.
- suggestedText must be write-ready but use explicit placeholders such as [baseline needed] when facts are unavailable.
- evidenceNeeded should say what source would validate the claim; use "None" when no external evidence is required.
- Extract only material unresolved decisions into decisionLedger. Do not turn every open question into a decision.\n- currentAssumption must say "Not stated" when the PRD does not state one.\n- The goal is to improve the artifact before human review, never replace human approval.`;

function extractJson(value: string) {
  const trimmed = value.trim().replace(/^\`\`\`json\s*/i, "").replace(/\`\`\`$/i, "").trim();
  return JSON.parse(trimmed);
}

export async function POST(request: Request) {
  try {
    const { document, context = "" } = await request.json();
    if (!document || typeof document !== "string" || document.trim().length < 100) {
      return NextResponse.json({ error: "Add a PRD draft of at least 100 characters to review." }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "PRD evaluation is not configured yet." }, { status: 503 });
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
        temperature: 0.15,
        max_tokens: 3500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: evaluatorPrompt },
          {
            role: "user",
            content: `PRD TO REVIEW:\n\n${document}\n\nOPTIONAL CONTEXT:\n${context || "No additional context supplied."}`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "The evaluator could not review this PRD." },
        { status: response.status },
      );
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "The evaluator returned an empty review." }, { status: 502 });

    try {
      const review = extractJson(content);
      if (!isPrdReview(review)) throw new Error("INVALID_REVIEW_CONTRACT");
      return NextResponse.json(review);
    } catch {
      return NextResponse.json({ error: "The evaluator returned an invalid scorecard. Please retry." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "The review request could not be completed." }, { status: 500 });
  }
}
