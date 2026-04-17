import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { rowToCoach, parsePercent, parseNum } from "../src/js/data.js";
import { parseCSV } from "../src/js/csv.js";

const fixtureCsv = readFileSync(new URL("../test-fixtures/sample-dashboard.csv", import.meta.url), "utf8");
const fixtureRows = parseCSV(fixtureCsv);

function sampleRow() {
  return {
    "ФИО": "Туловский Михаил",
    "Дети_сад_октябрь": "0",
    "Дети_школа_октябрь": "17",
    "Дети_сад_март": "0",
    "Дети_школа_март": "17",
    "Лагерь_план_осень": "6", "Лагерь_факт_осень": "4", "Лагерь_конверсия_осень": "3,33%",
    "Лагерь_план_зима": "6", "Лагерь_факт_зима": "5", "Лагерь_конверсия_зима": "4,17%",
    "Лагерь_план_весна": "7", "Лагерь_факт_весна": "3", "Лагерь_конверсия_весна": "2,50%",
    "Мерч_осень": "29", "Мерч_зима": "23",
    "Играющие_сборные": "0",
    "Кубок_метеор_октябрь": "1", "Кубок_метеор_декабрь": "16", "Кубок_метеор_февраль": "5", "Кубок_метеор_апрель": "7",
    "Суперлига_2015": "10", "Суперлига_2017": "0",
  };
}

test("rowToCoach: builds full Coach object with new shape", () => {
  const c = rowToCoach(sampleRow());
  assert.equal(c.fio, "Туловский Михаил");
  assert.equal(c.slug, "tulovskij-mihail");
  assert.equal(c.initials, "ТМ");
  assert.deepEqual(c.kids.october, { kindergarten: 0, school: 17, total: 17 });
  assert.deepEqual(c.kids.march, { kindergarten: 0, school: 17, total: 17 });
  assert.equal(c.kids.total, 17);
  assert.equal(c.camp.fact_total, 12);
  assert.equal(c.camp.plan_total, 19);
  assert.deepEqual(c.camp.seasons.autumn, { plan: 6, fact: 4, conversion: 3.33 });
  assert.deepEqual(c.camp.seasons.winter, { plan: 6, fact: 5, conversion: 4.17 });
  assert.deepEqual(c.camp.seasons.spring, { plan: 7, fact: 3, conversion: 2.5 });
  assert.deepEqual(c.merch, { total: 52, autumn: 29, winter: 23 });
  assert.equal(c.teams, 0);
  assert.equal(c.cup.total, 29);
  assert.deepEqual(c.cup.months, { october: 1, december: 16, february: 5, april: 7 });
  assert.deepEqual(c.league, { total: 10, born2015: 10, born2017: 0 });
});

test("fixture: contains an empty-fio padding row that must be filtered out", () => {
  const empty = fixtureRows.filter((r) => !r["ФИО"] || String(r["ФИО"]).trim().length === 0);
  assert.ok(empty.length >= 1, "fixture should include an empty padding row");
  const populated = fixtureRows.filter((r) => r["ФИО"] && String(r["ФИО"]).trim().length > 0);
  assert.equal(populated.length, 3);
});

test("parsePercent: handles '3,33%', '0,00%', empty string", () => {
  assert.equal(parsePercent("3,33%"), 3.33);
  assert.equal(parsePercent("0,00%"), 0);
  assert.equal(parsePercent(""), 0);
  assert.equal(parsePercent(undefined), 0);
});

test("parseNum: handles empty string and invalid as 0", () => {
  assert.equal(parseNum(""), 0);
  assert.equal(parseNum(undefined), 0);
  assert.equal(parseNum("abc"), 0);
  assert.equal(parseNum("17"), 17);
});

test("camp.fact_total = sum of season facts", () => {
  const c = rowToCoach(sampleRow());
  assert.equal(
    c.camp.fact_total,
    c.camp.seasons.autumn.fact + c.camp.seasons.winter.fact + c.camp.seasons.spring.fact
  );
});

test("merch.total = autumn + winter", () => {
  const c = rowToCoach(sampleRow());
  assert.equal(c.merch.total, c.merch.autumn + c.merch.winter);
});

test("cup.total = sum of 4 months", () => {
  const c = rowToCoach(sampleRow());
  const m = c.cup.months;
  assert.equal(c.cup.total, m.october + m.december + m.february + m.april);
});

test("league.total = born2015 + born2017", () => {
  const c = rowToCoach(sampleRow());
  assert.equal(c.league.total, c.league.born2015 + c.league.born2017);
});

test("kids: october and march tracked separately", () => {
  const c = rowToCoach(sampleRow());
  assert.equal(c.kids.october.kindergarten, 0);
  assert.equal(c.kids.october.school, 17);
  assert.equal(c.kids.march.kindergarten, 0);
  assert.equal(c.kids.march.school, 17);
});

test("rowToCoach: handles empty numeric cells as 0", () => {
  const c = rowToCoach({
    "ФИО": "Тест Тестов",
    "Дети_сад_октябрь": "",
    "Дети_школа_октябрь": "",
    "Дети_сад_март": "",
    "Дети_школа_март": "",
    "Мерч_осень": "",
    "Мерч_зима": "",
    "Кубок_метеор_октябрь": "",
    "Суперлига_2015": "",
  });
  assert.equal(c.kids.total, 0);
  assert.equal(c.merch.total, 0);
  assert.equal(c.cup.total, 0);
  assert.equal(c.league.total, 0);
  assert.equal(c.camp.fact_total, 0);
  assert.equal(c.camp.seasons.autumn.conversion, 0);
});

test("rowToCoach: initials from single name", () => {
  const c = rowToCoach({ "ФИО": "Нахушев" });
  assert.equal(c.initials, "Н");
});
