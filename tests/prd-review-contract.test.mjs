import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("evaluator contract includes calibrated review, evidence, and decision ledger", async () => {
  const route = await readFile(new URL("../app/api/evaluate/route.ts", import.meta.url), "utf8");
  const contract = await readFile(new URL("../app/lib/review-contract.ts", import.meta.url), "utf8");

  assert.match(route, /Opportunity & hypothesis/);
  assert.match(route, /Metrics, data rigor & guardrails/);
  assert.match(route, /specialized/);
  assert.match(route, /decisionLedger/);
  assert.match(route, /isPrdReview/);
  assert.match(contract, /dimensions\.length !== 6/);
  assert.match(contract, /critical_gap/);
  assert.match(contract, /evidenceNeeded/);
  assert.match(contract, /suggestedOwner/);
});

test("workspace exposes Draft, Review, and Decisions modes", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /Draft/);
  assert.match(page, /Review/);
  assert.match(page, /Decisions/);
  assert.match(page, /Review readiness/);
  assert.match(page, /Decision ledger/);
  assert.match(page, /\/api\/evaluate/);
});
