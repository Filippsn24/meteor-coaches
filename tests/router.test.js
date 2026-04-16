import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRoute } from "../src/js/router.js";

test("parseRoute: defaults to home", () => {
  assert.deepEqual(parseRoute(""), { name: "home" });
  assert.deepEqual(parseRoute("#/coaches"), { name: "home" });
});

test("parseRoute: extracts coach slug", () => {
  assert.deepEqual(parseRoute("#/coach/tulovskij-viktor"), { name: "coach", slug: "tulovskij-viktor" });
});
