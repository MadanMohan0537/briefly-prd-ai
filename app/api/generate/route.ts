import { NextResponse } from "next/server";

export const runtime = "edge";

const systemPrompt = `You are a principal product manager and an exceptional product writer.
Create a decision-ready Product Requirements Document in Markdown.
Use the supplied facts, make modest and clearly marked assumptions, and never invent research or customer evidence.
Use these sections: Executive summary, Context and problem, Goals and success metrics, Non-goals, Target users, User stories, Scope, Functional requirements, Experience requirements, Technical considerations, Risks and mitigations, Launch plan, and Open questions.
Requirements must be specific and testable. Metrics should include a baseline placeholder when unknown.
Return only the PRD in clean Markdown—no preamble or code fence.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, title, idea, audience, problem, constraints, tone } = body ?? {};

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ error: "A DeepSeek API key is required." }, { status: 400 });
    }
    if (!idea || !problem) {
      return NextResponse.json({ error: "The product idea and problem are required." }, { status: 400 });
    }

    const deepSeek = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.35,
        max_tokens: 4000,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Working title: ${title || "Untitled product"}
Product idea: ${idea}
Target users: ${audience || "Not yet defined"}
Problem: ${problem}
Constraints: ${constraints || "None supplied"}
Writing style: ${tone || "Clear and concise"}`,
          },
        ],
      }),
    });

    const data = await deepSeek.json();
    if (!deepSeek.ok) {
      const message = data?.error?.message || "DeepSeek rejected the request. Check your key and try again.";
      return NextResponse.json({ error: message }, { status: deepSeek.status });
    }

    const document = data?.choices?.[0]?.message?.content;
    if (!document) {
      return NextResponse.json({ error: "DeepSeek returned an empty document." }, { status: 502 });
    }
    return NextResponse.json({ document });
  } catch {
    return NextResponse.json({ error: "The request could not be completed. Please try again." }, { status: 500 });
  }
}
