import { fioToSlug } from "./slug.js";

export function computeConversion(plan, fact) {
  if (!plan || plan === 0) return null;
  return Math.round((fact / plan) * 100);
}

function num(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

function initials(fio) {
  const parts = fio.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

export function rowToCoach(row) {
  const camp = {
    seasons: {
      autumn: {
        plan: num(row.camp_plan_autumn),
        fact: num(row.camp_fact_autumn),
        conversion: computeConversion(num(row.camp_plan_autumn), num(row.camp_fact_autumn)),
      },
      winter: {
        plan: num(row.camp_plan_winter),
        fact: num(row.camp_fact_winter),
        conversion: computeConversion(num(row.camp_plan_winter), num(row.camp_fact_winter)),
      },
      spring: {
        plan: num(row.camp_plan_spring),
        fact: num(row.camp_fact_spring),
        conversion: computeConversion(num(row.camp_plan_spring), num(row.camp_fact_spring)),
      },
    },
  };
  camp.plan_total = camp.seasons.autumn.plan + camp.seasons.winter.plan + camp.seasons.spring.plan;
  camp.fact_total = camp.seasons.autumn.fact + camp.seasons.winter.fact + camp.seasons.spring.fact;
  camp.conversion = computeConversion(camp.plan_total, camp.fact_total);

  return {
    fio: row.fio,
    slug: fioToSlug(row.fio),
    initials: initials(row.fio),
    kids: num(row.kids),
    camp,
    merch: num(row.merch_total),
    teams: num(row.teams),
    cup: {
      plan: num(row.cup_plan),
      fact: num(row.cup_fact),
      conversion: computeConversion(num(row.cup_plan), num(row.cup_fact)),
    },
    league_teams: num(row.league_teams),
  };
}

export async function fetchCoaches(csvUrl) {
  const { parseCSV } = await import("./csv.js");
  const res = await fetch(csvUrl);
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
  const text = await res.text();
  return parseCSV(text).map(rowToCoach);
}
