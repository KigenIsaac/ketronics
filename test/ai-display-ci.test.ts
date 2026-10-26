import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const widget = readFileSync("src/components/ai/KetronicsAI.tsx", "utf8");
const workflow = readFileSync(".github/workflows/ci.yml", "utf8");

test("AI processing status is separate from customer-visible final answers", () => {
  assert.match(widget, /role="status" aria-live="polite"/);
  assert.match(widget, /Preparing your answer/);
  assert.match(widget, /typeof data\.answer === "string"/);
  assert.match(widget, /Render only the explicit final answer field/);
  assert.doesNotMatch(widget, /Thinking…/);
});

test("CI runs for stacked pull requests and includes a production build", () => {
  assert.match(workflow, /pull_request:\s*\n\s*push:/);
  assert.match(workflow, /run: npm run build/);
  assert.match(workflow, /run: npm test/);
  assert.match(workflow, /run: npm run verify/);
});
