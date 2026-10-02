# Briefly vNext — PRD Intelligence Workspace

Status: proposal / implementation started  
Branch: `feat/vnext-prd-evaluator`

## Product direction

Briefly should evolve from an AI PRD generator into a PRD intelligence workspace: **Draft → Review → Revise → Re-review → Share**.

The generator solves the blank-page problem. The next product problem is higher value: a PRD can look complete while still being weak for an actual product decision. vNext therefore adds a first-pass evaluator that looks for decision gaps before expensive cross-functional review.

This direction is inspired by the public lessons in Uber's "First-Pass AI PRD Reviewer" article, while using an original Briefly implementation and generic product-review framework rather than Uber-specific internal context or processes.

Reference: https://www.uber.com/us/en/blog/first-pass-prd/

## v0.2 — Decision-readiness evaluator (now)

### User outcome

A PM can paste or generate a PRD, request a review, and receive a compact scorecard that answers:

- What kind of change is this and how deeply should it be reviewed?
- Is the artifact ready for human review, ready with caveats, or not ready?
- What is the single most important thing to fix first?
- Which decision-readiness dimensions have material gaps?
- What exact text could be added or revised?
- What evidence is missing rather than merely unspecified?

### Review dimensions

1. Opportunity & hypothesis
2. Product scope & decision clarity
3. User experience & segment/edge-case impact
4. Metrics, data rigor & guardrails
5. Dependencies & adjacent-system impact
6. Risks, rollout & operational readiness

### Review calibration

- **Light:** UX parity, copy, discoverability, low-risk presentation changes
- **Standard:** incremental workflows and internal tooling migrations
- **Full:** net-new capabilities and material behavior changes
- **Specialized:** pricing, policy, marketplace, safety, security, privacy, compliance, and other high-consequence changes

### API contract

`POST /api/evaluate`

Input:

```json
{
  "document": "# PRD...",
  "context": "Optional supporting context"
}
```

Output:

```json
{
  "classification": {
    "type": "Net-new capability",
    "reviewDepth": "full",
    "reason": "Introduces a new user workflow"
  },
  "readiness": "ready_with_caveats",
  "summary": "The core proposal is understandable, but measurement and rollout need stronger definition.",
  "startHere": "Define the primary success metric, baseline, target, and guardrail.",
  "dimensions": [],
  "findings": [],
  "openQuestions": []
}
```

## v0.3 — Revision copilot

Turn findings into controlled edits instead of another wall of AI text.

- Apply one suggested fix at a time
- Show before/after diff
- Accept, edit, or reject each change
- Re-run only affected review dimensions
- Keep a revision history in local storage first

## v0.4 — Context pack

The evaluator becomes much more useful when it can distinguish "missing from the PRD" from "known elsewhere."

Add a context drawer for:
- customer research notes
- experiment summaries
- metric definitions and baselines
- technical constraints
- policy/compliance notes
- linked decision records

Initial implementation can accept pasted text/Markdown. Connectors and retrieval can follow later.

## v0.5 — Evidence-aware review

Each important claim or recommendation should expose its grounding:
- **PRD evidence:** quote/section in the current draft
- **Context evidence:** supplied supporting artifact
- **Unknown:** explicitly requires evidence

Never present model inference as company evidence.

## v0.6 — Team review mode

- Shareable review snapshot
- Human reviewer comments
- Resolve/reopen findings
- Separate AI findings from human decisions
- Export a review-ready Markdown packet

## UX proposal

Keep the existing two-column workspace, but change the right side into tabs:

**Draft | Review | Changes**

The Review tab should prioritize:
1. readiness state
2. Start Here
3. critical requirements
4. dimension assessments
5. optimizations

Do not lead with a numeric score. A number creates false precision; categorical readiness plus explicit gaps is more actionable.

## Engineering principles

- Preserve `/api/generate`; evaluation is additive.
- Keep model output behind a typed JSON contract.
- Treat invalid model JSON as a recoverable upstream error.
- Do not let AI make final approval decisions.
- Do not invent evidence, research, or company context.
- Keep provider-specific code server-side so models can be swapped later.
- Add deterministic contract tests before expanding the UI.

## Next implementation slices

1. Evaluator endpoint and contract — **started in v0.2**
2. Review tab UI with mock/real scorecard
3. Contract and failure-path tests
4. Revision actions
5. Context pack input
6. Persistence/version history
7. Evidence linking and retrieval
