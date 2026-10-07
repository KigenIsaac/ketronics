import test from "node:test";
import assert from "node:assert/strict";
import { attributesEqual } from "../src/lib/utils/attributes";

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

test("attributesEqual distinguishes null from a concrete value", () => {
  assert.equal(
    attributesEqual({ warranty: null }, { warranty: true }),
    false,
  );
});

test("undefined and an empty attribute set are treated consistently", () => {
  assert.equal(attributesEqual(undefined, {}), true);
});

test("multiple primitive attributes remain deterministic", () => {
  assert.equal(
    attributesEqual(
      { color: "black", storage: 512, refurbished: false, warranty: null },
      { warranty: null, refurbished: false, storage: 512, color: "black" },
    ),
    true,
  );
});
