import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { rowToCoach, parsePercent, parseNum } from "../src/js/data.js";
import { parseCSV } from "../src/js/csv.js";

const fixtureCsv = readFileSync(new URL("../test-fixtures/sample-dashboard.csv", import.meta.url), "utf8");
const fixtureRows = parseCSV(fixtureCsv);

function sampleRow() {
  return {
    fio: "Туловский Михаил",
    kids_kindergarten: "0",
    kids_school: "17",
    camp_plan_autumn: "6", camp_fact_autumn: "4", camp_conv_autumn: "3,33%",
    camp_plan_winter: "6", camp_fact_winter: "5", camp_conv_winter: "4,17%",
    camp_plan_spring: "7", camp_fact_spring: "3", camp_conv_spring: "2,50%",
    merch_autumn: "29", merch_winter: "23",
    teams: "0",
    cup_october: "1", cup_december: "16", cup_february: "5", cup_april: "7",
    league_2015: "10", league_2017: "0",
  };
}

test("rowToCoach: builds full Coach object with new shape", () => {
  const c = rowToCoach(sampleRow());
  assert.equal(c.fio, "Туловский Михаил");
  assert.equal(c.slug, "tulovskij-mihail");
  assert.equal(c.initials, "ТМ");
  assert.deepEqual(c.kids, { kindergarten: 0, school: 17, total: 17 });
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
  const empty = fixtureRows.filter((r) => !r.fio || String(r.fio).trim().length === 0);
  assert.ok(empty.length >= 1, "fixture should include an empty padding row");
  const populated = fixtureRows.filter((r) => r.fio && String(r.fio).trim().length > 0);
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

test("kids.total = kindergarten + school", () => {
  const c = rowToCoach(sampleRow());
  assert.equal(c.kids.total, c.kids.kindergarten + c.kids.school);
});

test("rowToCoach: handles empty numeric cells as 0", () => {
  const c = rowToCoach({
    fio: "Тест Тестов",
    kids_kindergarten: "",
    kids_school: "",
    merch_autumn: "",
    merch_winter: "",
    cup_october: "",
    league_2015: "",
  });
  assert.equal(c.kids.total, 0);
  assert.equal(c.merch.total, 0);
  assert.equal(c.cup.total, 0);
  assert.equal(c.league.total, 0);
  assert.equal(c.camp.fact_total, 0);
  assert.equal(c.camp.seasons.autumn.conversion, 0);
});

test("rowToCoach: initials from single name", () => {
  const c = rowToCoach({ fio: "Нахушев" });
  assert.equal(c.initials, "Н");
});
