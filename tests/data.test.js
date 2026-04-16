import { test } from "node:test";
import assert from "node:assert/strict";
import { rowToCoach, computeConversion } from "../src/js/data.js";

test("computeConversion: returns null when plan is 0", () => {
  assert.equal(computeConversion(0, 5), null);
});

test("computeConversion: rounds to integer percent", () => {
  assert.equal(computeConversion(17, 9), 53);
  assert.equal(computeConversion(10, 10), 100);
});

test("rowToCoach: builds full Coach object", () => {
  const row = {
    fio: "Туловский Виктор",
    kids: "17",
    camp_plan_autumn: "17", camp_fact_autumn: "9",
    camp_plan_winter: "17", camp_fact_winter: "5",
    camp_plan_spring: "17", camp_fact_spring: "7",
    merch_total: "24",
    teams: "4",
    cup_plan: "30", cup_fact: "12",
    league_teams: "2",
  };
  const c = rowToCoach(row);
  assert.equal(c.fio, "Туловский Виктор");
  assert.equal(c.slug, "tulovskij-viktor");
  assert.equal(c.initials, "ТВ");
  assert.equal(c.kids, 17);
  assert.equal(c.camp.plan_total, 51);
  assert.equal(c.camp.fact_total, 21);
  assert.equal(c.camp.conversion, 41);
  assert.deepEqual(c.camp.seasons.autumn, { plan: 17, fact: 9, conversion: 53 });
  assert.equal(c.merch, 24);
  assert.equal(c.teams, 4);
  assert.equal(c.cup.plan, 30);
  assert.equal(c.cup.fact, 12);
  assert.equal(c.cup.conversion, 40);
  assert.equal(c.league_teams, 2);
});

test("rowToCoach: initials from single name", () => {
  const c = rowToCoach({ fio: "Нахушев", kids: "0" });
  assert.equal(c.initials, "Н");
});

test("rowToCoach: handles empty/missing numeric cells as 0", () => {
  const c = rowToCoach({ fio: "Тест Тестов", kids: "", merch_total: "" });
  assert.equal(c.kids, 0);
  assert.equal(c.merch, 0);
});
