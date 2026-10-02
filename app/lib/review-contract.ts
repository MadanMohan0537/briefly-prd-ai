export type ReviewDepth = "light" | "standard" | "full" | "specialized";
export type Readiness = "ready" | "ready_with_caveats" | "not_ready";
export type DimensionStatus = "looks_good" | "needs_review" | "critical_gap";
export type FindingPriority = "critical" | "important" | "optimization";

export type ReviewDimension = {
  name: string;
  status: DimensionStatus;
  assessment: string;
};

export type ReviewFinding = {
  priority: FindingPriority;
  title: string;
  missing: string;
  suggestedText: string;
  evidenceNeeded: string;
};

export type DecisionItem = {
  decision: string;
  whyItMatters: string;
  currentAssumption: string;
  evidenceNeeded: string;
  suggestedOwner: "product" | "design" | "engineering" | "data" | "legal_policy" | "cross_functional";
};

export type PrdReview = {
  classification: { type: string; reviewDepth: ReviewDepth; reason: string };
  readiness: Readiness;
  summary: string;
  startHere: string;
  dimensions: ReviewDimension[];
  findings: ReviewFinding[];
  openQuestions: string[];
  decisionLedger: DecisionItem[];
};

const reviewDepths = new Set<ReviewDepth>(["light", "standard", "full", "specialized"]);
const readinessStates = new Set<Readiness>(["ready", "ready_with_caveats", "not_ready"]);
const dimensionStates = new Set<DimensionStatus>(["looks_good", "needs_review", "critical_gap"]);
const priorities = new Set<FindingPriority>(["critical", "important", "optimization"]);

export function isPrdReview(value: unknown): value is PrdReview {
  if (!value || typeof value !== "object") return false;
  const review = value as Partial<PrdReview>;
  if (!review.classification || typeof review.classification !== "object") return false;
  if (!reviewDepths.has(review.classification.reviewDepth as ReviewDepth)) return false;
  if (typeof review.classification.type !== "string" || typeof review.classification.reason !== "string") return false;
  if (!readinessStates.has(review.readiness as Readiness)) return false;
  if (typeof review.summary !== "string" || typeof review.startHere !== "string") return false;
  if (!Array.isArray(review.dimensions) || review.dimensions.length !== 6) return false;
  if (!review.dimensions.every((item) => item && typeof item.name === "string" && dimensionStates.has(item.status) && typeof item.assessment === "string")) return false;
  if (!Array.isArray(review.findings) || !review.findings.every((item) => item && priorities.has(item.priority) && typeof item.title === "string" && typeof item.missing === "string" && typeof item.suggestedText === "string" && typeof item.evidenceNeeded === "string")) return false;
  if (!Array.isArray(review.openQuestions) || !review.openQuestions.every((item) => typeof item === "string")) return false;
  if (!Array.isArray(review.decisionLedger) || !review.decisionLedger.every((item) => item && typeof item.decision === "string" && typeof item.whyItMatters === "string" && typeof item.currentAssumption === "string" && typeof item.evidenceNeeded === "string" && typeof item.suggestedOwner === "string")) return false;
  return true;
}
