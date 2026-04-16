import { fioToSlug } from "./slug.js";
import { parseCSV } from "./csv.js";

export function parseNum(s) {
  if (s === undefined || s === null || s === "") return 0;
  const n = parseInt(String(s).trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

export function parsePercent(s) {
  if (!s) return 0;
  const cleaned = String(s).trim().replace("%", "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function initials(fio) {
  const parts = fio.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

export function rowToCoach(row) {
  const kindergarten = parseNum(row.kids_kindergarten);
  const school = parseNum(row.kids_school);

  const seasons = {
    autumn: {
      plan: parseNum(row.camp_plan_autumn),
      fact: parseNum(row.camp_fact_autumn),
      conversion: parsePercent(row.camp_conv_autumn),
    },
    winter: {
      plan: parseNum(row.camp_plan_winter),
      fact: parseNum(row.camp_fact_winter),
      conversion: parsePercent(row.camp_conv_winter),
    },
    spring: {
      plan: parseNum(row.camp_plan_spring),
      fact: parseNum(row.camp_fact_spring),
      conversion: parsePercent(row.camp_conv_spring),
    },
  };
  const plan_total = seasons.autumn.plan + seasons.winter.plan + seasons.spring.plan;
  const fact_total = seasons.autumn.fact + seasons.winter.fact + seasons.spring.fact;

  const merch_autumn = parseNum(row.merch_autumn);
  const merch_winter = parseNum(row.merch_winter);

  const cup_october = parseNum(row.cup_october);
  const cup_december = parseNum(row.cup_december);
  const cup_february = parseNum(row.cup_february);
  const cup_april = parseNum(row.cup_april);

  const born2015 = parseNum(row.league_2015);
  const born2017 = parseNum(row.league_2017);

  return {
    fio: row.fio,
    slug: fioToSlug(row.fio),
    initials: initials(row.fio),
    kids: {
      kindergarten,
      school,
      total: kindergarten + school,
    },
    camp: {
      fact_total,
      plan_total,
      seasons,
    },
    merch: {
      total: merch_autumn + merch_winter,
      autumn: merch_autumn,
      winter: merch_winter,
    },
    teams: parseNum(row.teams),
    cup: {
      total: cup_october + cup_december + cup_february + cup_april,
      months: {
        october: cup_october,
        december: cup_december,
        february: cup_february,
        april: cup_april,
      },
    },
    league: {
      total: born2015 + born2017,
      born2015,
      born2017,
    },
  };
}

export async function fetchCoaches(csvUrl) {
  const res = await fetch(csvUrl);
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
  const text = await res.text();
  return parseCSV(text)
    .filter((row) => row.fio && String(row.fio).trim().length > 0)
    .map(rowToCoach);
}
