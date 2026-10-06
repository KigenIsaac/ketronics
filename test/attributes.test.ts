import test from "node:test";
import assert from "node:assert/strict";
import { attributesEqual } from "../src/lib/utils/attributes.ts";

test("attributesEqual treats object key order as irrelevant", () => {
  assert.equal(
    attributesEqual(
      { color: "black", storage: 512 },
      { storage: 512, color: "black" },
    ),
    true,
  );
});

test("attributesEqual distinguishes different values", () => {
  assert.equal(
    attributesEqual({ color: "black" }, { color: "white" }),
    false,
  );
});

test("attributesEqual distinguishes arrays by order", () => {
  assert.equal(
    attributesEqual({ sizes: ["S", "M"] }, { sizes: ["M", "S"] }),
    false,
  );
});

test("undefined and an empty attribute set are treated consistently", () => {
  assert.equal(attributesEqual(undefined, {}), true);
});

test("nested objects are compared deterministically", () => {
  assert.equal(
    attributesEqual(
      { config: { warranty: true, memory: 16 } },
      { config: { memory: 16, warranty: true } },
    ),
    true,
  );
});
