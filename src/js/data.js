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
  const kgOct = parseNum(row["Дети_сад_октябрь"]);
  const schOct = parseNum(row["Дети_школа_октябрь"]);
  const kgMar = parseNum(row["Дети_сад_март"]);
  const schMar = parseNum(row["Дети_школа_март"]);

  const seasons = {
    autumn: {
      plan: parseNum(row["Лагерь_план_осень"]),
      fact: parseNum(row["Лагерь_факт_осень"]),
      conversion: parsePercent(row["Лагерь_конверсия_осень"]),
    },
    winter: {
      plan: parseNum(row["Лагерь_план_зима"]),
      fact: parseNum(row["Лагерь_факт_зима"]),
      conversion: parsePercent(row["Лагерь_конверсия_зима"]),
    },
    spring: {
      plan: parseNum(row["Лагерь_план_весна"]),
      fact: parseNum(row["Лагерь_факт_весна"]),
      conversion: parsePercent(row["Лагерь_конверсия_весна"]),
    },
  };
  const plan_total = seasons.autumn.plan + seasons.winter.plan + seasons.spring.plan;
  const fact_total = seasons.autumn.fact + seasons.winter.fact + seasons.spring.fact;

  const merch_autumn = parseNum(row["Мерч_осень"]);
  const merch_winter = parseNum(row["Мерч_зима"]);

  const cup_october = parseNum(row["Кубок_метеор_октябрь"]);
  const cup_december = parseNum(row["Кубок_метеор_декабрь"]);
  const cup_february = parseNum(row["Кубок_метеор_февраль"]);
  const cup_april = parseNum(row["Кубок_метеор_апрель"]);

  const born2015 = parseNum(row["Суперлига_2015"]);
  const born2017 = parseNum(row["Суперлига_2017"]);

  return {
    fio: row["ФИО"],
    slug: fioToSlug(row["ФИО"]),
    initials: initials(row["ФИО"]),
    kids: {
      kindergarten: kgOct,
      school: schOct,
      total: kgOct + schOct,
      october: { kindergarten: kgOct, school: schOct, total: kgOct + schOct },
      march: { kindergarten: kgMar, school: schMar, total: kgMar + schMar },
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
    teams: parseNum(row["Играющие_сборные"]),
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
    penalty: parseNum(row["Штраф_апрель"]),
  };
}

export function calculateRatings(coaches) {
  const kidsTotal = (c) => c.kids.march.total || c.kids.october.total || 1;
  const per10 = (val, c) => val / kidsTotal(c) * 10;

  // Средняя конверсия лагеря
  const campAvg = (c) => {
    const convs = [c.camp.seasons.autumn, c.camp.seasons.winter, c.camp.seasons.spring]
      .filter((s) => s.plan > 0);
    if (convs.length === 0) return 0;
    return convs.reduce((sum, s) => sum + s.conversion, 0) / convs.length;
  };

  // Сырые значения для каждого тренера
  const raw = coaches.map((c) => ({
    camp: campAvg(c),
    merch: per10(c.merch.total, c),
    cup: per10(c.cup.total, c),
    league: c.league.total,
  }));

  // Максимумы для нормализации
  const max = {
    camp: Math.max(...raw.map((r) => r.camp), 1),
    merch: Math.max(...raw.map((r) => r.merch), 1),
    cup: Math.max(...raw.map((r) => r.cup), 1),
    league: Math.max(...raw.map((r) => r.league), 1),
  };

  // Считаем баллы
  return coaches.map((c, i) => {
    const r = raw[i];
    const scores = {
      camp: +(r.camp / max.camp * 5).toFixed(1),
      merch: +(r.merch / max.merch * 5).toFixed(1),
      cup: +(r.cup / max.cup * 5).toFixed(1),
      league: +(r.league / max.league * 5).toFixed(1),
      teams: +(Math.min(c.teams * 1.5, 5)).toFixed(1),
    };
    const bonus = scores.camp + scores.merch + scores.cup + scores.league + scores.teams;
    const total = +(bonus - c.penalty).toFixed(1);
    c.rating = { scores, penalty: c.penalty, bonus, total };
    return c;
  });
}

export async function fetchCoaches(csvUrl) {
  const res = await fetch(csvUrl);
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
  const text = await res.text();
  const coaches = parseCSV(text)
    .filter((row) => {
      const fio = row["ФИО"] ? String(row["ФИО"]).trim() : "";
      if (!fio) return false;
      return /\s/.test(fio);
    })
    .map(rowToCoach);
  return calculateRatings(coaches);
}
