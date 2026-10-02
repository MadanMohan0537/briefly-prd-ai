"use client";

import { useEffect, useMemo, useState } from "react";
import type { PrdReview } from "./lib/review-contract";

type Project = {
  title: string;
  idea: string;
  audience: string;
  problem: string;
  constraints: string;
  tone: string;
};

const starter: Project = {
  title: "",
  idea: "",
  audience: "",
  problem: "",
  constraints: "",
  tone: "Clear & concise",
};

const samplePrd = `# Smart onboarding assistant

## Executive summary
Create an adaptive onboarding experience that guides new workspace admins to their first successful team launch in under ten minutes.

## Problem
New admins face a blank workspace and do not know which setup steps matter first. This delays team activation and increases support requests.

## Goals & success metrics
- Reduce median time-to-first-team-invite from 24 hours to 10 minutes.
- Increase seven-day workspace activation from 42% to 60%.
- Reduce onboarding-related support tickets by 25%.

## Target users
Primary: first-time workspace admins at teams of 5–50 people.
Secondary: team leads helping an admin configure their workspace.

## User stories
- As a new admin, I want a prioritized setup checklist so I know what to do next.
- As a team lead, I want to preview the workspace before inviting colleagues.

## Scope
### In scope
- Role-aware setup checklist
- Contextual guidance and progress tracking
- Invite preview and validation

### Out of scope
- Full workspace migration
- Custom onboarding templates

## Functional requirements
1. The system must recommend the next setup action based on completed steps.
2. Users must be able to dismiss or revisit guidance.
3. Progress must persist across sessions.

## Risks & mitigations
- Too many prompts may feel intrusive — cap proactive prompts and provide a quiet mode.
- Incorrect recommendations may reduce trust — show why each step is suggested.

## Launch plan
Internal dogfood, followed by a 10% beta cohort, then staged rollout based on activation and support metrics.

## Open questions
- Which setup action best predicts long-term retention?
- Should dismissed guidance expire after a product update?`;

function wordCount(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export default function Home() {
  const [project, setProject] = useState<Project>(starter);
  const [document, setDocument] = useState("");
  const [remaining, setRemaining] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"draft" | "review" | "decisions">("draft");
  const [review, setReview] = useState<PrdReview | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = localStorage.getItem("briefly-project");
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          setProject(saved.project ?? starter);
          setDocument(saved.document ?? "");
        } catch {
          localStorage.removeItem("briefly-project");
        }
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/generate", { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (response.ok) setRemaining(result.remaining);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem("briefly-project", JSON.stringify({ project, document }));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [project, document]);

  const quality = useMemo(() => {
    let score = 0;
    if (document.length > 600) score += 35;
    if (/## Goals|## Success/i.test(document)) score += 20;
    if (/## User|## Audience/i.test(document)) score += 15;
    if (/## Risk/i.test(document)) score += 15;
    if (/## Open questions/i.test(document)) score += 15;
    return Math.min(score, 100);
  }, [document]);

  function update(field: keyof Project, value: string) {
    setProject((current) => ({ ...current, [field]: value }));
  }

  async function generate() {
    setError("");
    if (!project.idea.trim() || !project.problem.trim()) {
      setError("Add a product idea and the problem it solves first.");
      return;
    }
    if (remaining <= 0) {
      setError("You have used all three free PRDs.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      const result = await response.json();
      if (typeof result.remaining === "number") setRemaining(result.remaining);
      if (!response.ok) throw new Error(result.error || "DeepSeek could not generate the PRD.");
      setDocument(result.document);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function reviewReadiness() {
    setError("");
    if (document.trim().length < 100) {
      setError("Generate or paste a fuller PRD before requesting a readiness review.");
      return;
    }
    setIsReviewing(true);
    try {
      const context = [
        project.audience && `Target users: ${project.audience}`,
        project.constraints && `Constraints: ${project.constraints}`,
      ].filter(Boolean).join("\n");
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, context }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The PRD review could not be completed.");
      setReview(result);
      setMode("review");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The PRD review could not be completed.");
    } finally {
      setIsReviewing(false);
    }
  }

  function download() {
    if (!document) return;
    const blob = new Blob([document], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${project.title || "product-requirements"}.md`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    link.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setProject(starter);
    setDocument("");
    setError("");
    setReview(null);
    setMode("draft");
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="Briefly home">
          <span className="brand-mark">B</span>
          <span>Briefly</span>
        </a>
        <div className="top-actions">
          <span className="save-status"><span className="status-dot" />Saved locally</span>
          <span className="usage-pill"><b>{remaining}</b> free PRDs left</span>
          <button className="dark-button" onClick={download} disabled={!document}>
            Export <span aria-hidden>↓</span>
          </button>
        </div>
      </header>

      <section className="intro">
        <p className="eyebrow">AI PRD WORKSPACE</p>
        <h1>Turn the fuzzy idea into<br />a focused product plan.</h1>
        <p className="lede">Give Briefly the context. Get a thoughtful first draft you can shape, share, and ship.</p>
      </section>

      <section id="workspace" className="workspace" aria-label="PRD workspace">
        <aside className="brief-panel">
          <div className="panel-heading">
            <div>
              <span className="step-label">01</span>
              <h2>Shape the brief</h2>
            </div>
            <button className="text-button" onClick={reset}>Clear</button>
          </div>

          <label>
            Working title
            <input value={project.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Smart onboarding assistant" />
          </label>
          <label>
            What are you building? <span className="required">*</span>
            <textarea value={project.idea} onChange={(e) => update("idea", e.target.value)} placeholder="Describe the product, feature, or improvement in a few sentences…" />
          </label>
          <label>
            Who is it for?
            <input value={project.audience} onChange={(e) => update("audience", e.target.value)} placeholder="e.g. New workspace admins at small teams" />
          </label>
          <label>
            What problem does it solve? <span className="required">*</span>
            <textarea value={project.problem} onChange={(e) => update("problem", e.target.value)} placeholder="What is difficult today, and why does it matter?" />
          </label>

          <div className="field-row">
            <label>
              Writing style
              <select value={project.tone} onChange={(e) => update("tone", e.target.value)}>
                <option>Clear & concise</option>
                <option>Detailed & technical</option>
                <option>Executive-ready</option>
              </select>
            </label>
            <label>
              Constraints
              <input value={project.constraints} onChange={(e) => update("constraints", e.target.value)} placeholder="Timeline, budget…" />
            </label>
          </div>

          {error && <p className="error" role="alert">{error}</p>}
          <button className="generate-button" onClick={generate} disabled={isGenerating || remaining <= 0}>
            <span className="spark" aria-hidden>✦</span>
            {isGenerating
              ? "Your PRD is generating…"
              : remaining > 0
                ? "Generate my PRD"
                : "Free limit reached"}
            {!isGenerating && <span aria-hidden>→</span>}
          </button>
          <p className="key-note">Every visitor can generate up to three PRDs for free.</p>
        </aside>

        <section className="document-panel">
          <div className="document-toolbar">
            <div>
              <span className="step-label">02</span>
              <h2>{mode === "draft" ? "Refine the document" : mode === "review" ? "Review readiness" : "Decision ledger"}</h2>
            </div>
            <div className="document-meta">
              <span>{wordCount(document)} words</span>
              <button className="review-button" onClick={reviewReadiness} disabled={!document || isReviewing}>
                {isReviewing ? "Reviewing…" : "Review readiness"}
              </button>
            </div>
          </div>
          <div className="workspace-tabs" role="tablist" aria-label="PRD workspace modes">
            {(["draft", "review", "decisions"] as const).map((tab) => (
              <button key={tab} className={mode === tab ? "active" : ""} onClick={() => setMode(tab)} disabled={tab !== "draft" && !review}>
                {tab === "draft" ? "Draft" : tab === "review" ? "Review" : "Decisions"}
              </button>
            ))}
          </div>

          {document && mode === "draft" ? (
            <textarea
              className="editor"
              aria-label="Product requirements document"
              value={document}
              onChange={(e) => { setDocument(e.target.value); setReview(null); }}
              spellCheck
            />
          ) : review && mode === "review" ? (
            <div className="review-view">
              <div className={`readiness-card ${review.readiness}`}>
                <span>{review.classification.type} · {review.classification.reviewDepth} review</span>
                <h3>{review.readiness.replaceAll("_", " ")}</h3>
                <p>{review.summary}</p>
              </div>
              <article className="start-here"><b>Start here</b><p>{review.startHere}</p></article>
              <div className="dimension-list">
                {review.dimensions.map((item) => <article key={item.name}><span className={`status-dot-large ${item.status}`} /><div><b>{item.name}</b><p>{item.assessment}</p></div></article>)}
              </div>
              <h3 className="review-section-title">Prioritized findings</h3>
              <div className="finding-list">
                {review.findings.map((item, index) => <article key={`${item.title}-${index}`}><span className={`priority ${item.priority}`}>{item.priority}</span><h4>{item.title}</h4><p>{item.missing}</p><details><summary>Suggested PRD text</summary><pre>{item.suggestedText}</pre><small>Evidence needed: {item.evidenceNeeded}</small></details></article>)}
              </div>
            </div>
          ) : review && mode === "decisions" ? (
            <div className="review-view">
              <div className="decision-intro"><span className="step-label">BRIEFLY ORIGINAL</span><h3>Turn ambiguity into a queue.</h3><p>These are material decisions the team still needs to make. They are not AI approvals.</p></div>
              <div className="decision-list">
                {review.decisionLedger.length ? review.decisionLedger.map((item, index) => <article key={`${item.decision}-${index}`}><span>{item.suggestedOwner.replace("_", " ")}</span><h4>{item.decision}</h4><p><b>Why it matters:</b> {item.whyItMatters}</p><p><b>Current assumption:</b> {item.currentAssumption}</p><p><b>Evidence needed:</b> {item.evidenceNeeded}</p></article>) : <p>No material unresolved decisions were extracted from this review.</p>}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="paper-stack" aria-hidden>
                <div className="paper back" />
                <div className="paper front">
                  <span />
                  <strong />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <h3>Your PRD will take shape here.</h3>
              <p>Complete the brief, then let DeepSeek build a structured draft with goals, user stories, requirements, risks, and open questions.</p>
              <button className="sample-button" onClick={() => {
                setProject({
                  title: "Smart onboarding assistant",
                  idea: "An adaptive checklist that guides new admins through workspace setup.",
                  audience: "First-time workspace admins at teams of 5–50",
                  problem: "Admins face a blank workspace and struggle to identify the setup steps that lead to activation.",
                  constraints: "MVP in one quarter",
                  tone: "Clear & concise",
                });
                setDocument(samplePrd);
              }}>See an example</button>
            </div>
          )}
        </section>
      </section>

      <section className="promise">
        <span>Built for the messy middle</span>
        <p>Strong PRDs are not about more pages. They are about sharper decisions. Briefly helps you name the user, define success, expose risk, and leave the team with fewer unanswered questions.</p>
        <div className="promise-grid">
          <article><b>01</b><h3>Context before copy</h3><p>A short guided brief gives the model the signal it needs.</p></article>
          <article><b>02</b><h3>A useful structure</h3><p>Every draft covers outcomes, scope, stories, requirements, and risks.</p></article>
          <article><b>03</b><h3>Your document, your call</h3><p>Edit freely, keep drafts on your device, and export clean Markdown.</p></article>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#"><span className="brand-mark">B</span><span>Briefly</span></a>
        <p>Write less. Decide better.</p>
      </footer>
    </main>
  );
}
