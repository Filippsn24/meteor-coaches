import { test } from "node:test";
import assert from "node:assert/strict";
import { fioToSlug } from "../src/js/slug.js";

test("fioToSlug: simple FIO", () => {
  assert.equal(fioToSlug("Туловский Виктор"), "tulovskij-viktor");
});

test("fioToSlug: handles ё, щ, ж", () => {
  assert.equal(fioToSlug("Ёжиков Щукин"), "yozhikov-shchukin");
});

test("fioToSlug: handles single name", () => {
  assert.equal(fioToSlug("Нахушев"), "nahushev");
});

test("fioToSlug: handles ь, ъ (drops them)", () => {
  assert.equal(fioToSlug("Подъездов"), "podezdov");
});

test("fioToSlug: trims and lowercases", () => {
  assert.equal(fioToSlug("  Ивано́в  "), "ivanov");
});
