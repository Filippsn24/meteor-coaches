import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, checkPassword } from "../src/js/auth.js";

test("hashPassword: returns hex string of length 64", async () => {
  const h = await hashPassword("hello");
  assert.equal(typeof h, "string");
  assert.equal(h.length, 64);
  assert.match(h, /^[0-9a-f]+$/);
});

test("hashPassword: known SHA-256 of 'hello'", async () => {
  const h = await hashPassword("hello");
  assert.equal(h, "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
});

test("checkPassword: matches correct password against its hash", async () => {
  const hash = await hashPassword("meteor2026");
  assert.equal(await checkPassword("meteor2026", hash), true);
});

test("checkPassword: rejects wrong password", async () => {
  const hash = await hashPassword("meteor2026");
  assert.equal(await checkPassword("wrong", hash), false);
});
