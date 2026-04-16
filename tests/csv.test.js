import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCSV } from "../src/js/csv.js";

test("parseCSV: parses header and rows into array of objects", () => {
  const csv = "name,age\nIvan,30\nMaria,25";
  const rows = parseCSV(csv);
  assert.deepEqual(rows, [
    { name: "Ivan", age: "30" },
    { name: "Maria", age: "25" },
  ]);
});

test("parseCSV: handles empty cells", () => {
  const csv = "a,b,c\n1,,3";
  assert.deepEqual(parseCSV(csv), [{ a: "1", b: "", c: "3" }]);
});

test("parseCSV: handles quoted fields with commas inside", () => {
  const csv = 'name,note\nИванов,"hello, world"';
  assert.deepEqual(parseCSV(csv), [{ name: "Иванов", note: "hello, world" }]);
});

test("parseCSV: trims trailing newline and CRLF", () => {
  const csv = "a,b\r\n1,2\r\n";
  assert.deepEqual(parseCSV(csv), [{ a: "1", b: "2" }]);
});

test("parseCSV: ignores blank lines", () => {
  const csv = "a,b\n1,2\n\n3,4";
  assert.deepEqual(parseCSV(csv), [{ a: "1", b: "2" }, { a: "3", b: "4" }]);
});
