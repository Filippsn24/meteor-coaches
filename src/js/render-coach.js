import { fetchCoaches } from "./data.js";
import { CSV_URL, SEASON_LABEL } from "./config.js";

let cache = null;
async function getCoaches() {
  if (cache) return cache;
  cache = await fetchCoaches(CSV_URL);
  return cache;
}

export async function renderCoach(root, slug) {
  const coaches = await getCoaches();
  const coach = coaches.find((c) => c.slug === slug);
  if (!coach) {
    root.innerHTML = `<p style="padding:32px;">Тренер не найден. <a href="#/coaches" style="color:#9F1239;">← Все тренеры</a></p>`;
    return;
  }
  const leagueValue = coach.league.total > 0
    ? `${coach.league.total} <span class="small">команд</span>`
    : `${coach.league.total}`;

  root.innerHTML = `
    <section class="coach-hero">
      <div class="coach-hero-inner">
        <div class="coach-hero-avatar">${escapeHtml(coach.initials)}</div>
        <div class="coach-hero-text">
          <h1 class="coach-hero-fio">${escapeHtml(coach.fio)}</h1>
          <div class="coach-hero-meta">ТРЕНЕР · СЕЗОН ${SEASON_LABEL}</div>
        </div>
        <a href="#/coaches" class="coach-back">← Все тренеры</a>
      </div>
    </section>
    <section class="kpi-grid">
      ${kpiKids(coach.kids)}
      ${kpiPlanFact({
        label: "Лагерь (год)",
        fact: coach.camp.fact_total,
        plan: coach.camp.plan_total,
        seasons: coach.camp.seasons,
      })}
      ${kpiTile({
        label: "Мерч продано",
        valueHtml: `${coach.merch.total} <span class="small">шт</span>`,
        expandable: true,
        rows: [
          { label: "Осень", value: coach.merch.autumn },
          { label: "Зима", value: coach.merch.winter },
        ],
      })}
      ${kpiTile({
        label: "Играющие сборные",
        valueHtml: String(coach.teams),
        expandable: false,
      })}
      ${kpiTile({
        label: "Кубок Метеора",
        valueHtml: String(coach.cup.total),
        expandable: true,
        rows: [
          { label: "Октябрь", value: coach.cup.months.october },
          { label: "Декабрь", value: coach.cup.months.december },
          { label: "Февраль", value: coach.cup.months.february },
          { label: "Апрель", value: coach.cup.months.april },
        ],
      })}
      ${kpiTile({
        label: "Суперлига",
        valueHtml: leagueValue,
        expandable: true,
        rows: [
          { label: "2015 г.р.", value: coach.league.born2015 },
          { label: "2017 г.р.", value: coach.league.born2017 },
        ],
      })}
    </section>
  `;
  root.querySelectorAll(".kpi.expandable").forEach((el) => {
    el.addEventListener("click", () => el.classList.toggle("expanded"));
  });
}

function kpiKids(kids) {
  const oct = kids.october;
  const mar = kids.march;
  const diffKg = mar.kindergarten - oct.kindergarten;
  const diffSch = mar.school - oct.school;
  const diffTotal = mar.total - oct.total;
  const sign = (n) => n > 0 ? `+${n}` : String(n);
  const cls = (n) => n > 0 ? "diff-up" : n < 0 ? "diff-down" : "diff-zero";
  return `
    <div class="kpi expandable">
      <div class="kpi-label">Дети в группах</div>
      <div class="kpi-value">${oct.total} → ${mar.total} <span class="small ${cls(diffTotal)}">${sign(diffTotal)}</span></div>
      <div class="kpi-seasons">
        <div class="kpi-seasons-row"><span></span><span><b>Окт</b> → <b>Мар</b></span></div>
        <div class="kpi-seasons-row"><span>Сад</span><span><b>${oct.kindergarten}</b> → <b>${mar.kindergarten}</b> <span class="${cls(diffKg)}">${sign(diffKg)}</span></span></div>
        <div class="kpi-seasons-row"><span>Школа</span><span><b>${oct.school}</b> → <b>${mar.school}</b> <span class="${cls(diffSch)}">${sign(diffSch)}</span></span></div>
      </div>
    </div>
  `;
}

function kpiTile({ label, valueHtml, expandable, rows }) {
  const expandBlock = expandable && rows && rows.length
    ? `
      <div class="kpi-seasons">
        ${rows.map((r) => `<div class="kpi-seasons-row"><span>${escapeHtml(r.label)}</span><span><b>${r.value}</b></span></div>`).join("")}
      </div>
    `
    : "";
  return `
    <div class="kpi ${expandable && rows && rows.length ? "expandable" : ""}">
      <div class="kpi-label">${escapeHtml(label)}</div>
      <div class="kpi-value">${valueHtml}</div>
      ${expandBlock}
    </div>
  `;
}

function kpiPlanFact({ label, fact, plan, seasons }) {
  const seasonsBlock = seasons ? `
    <div class="kpi-seasons">
      ${seasonRow("Осень", seasons.autumn)}
      ${seasonRow("Зима", seasons.winter)}
      ${seasonRow("Весна", seasons.spring)}
    </div>
  ` : "";
  return `
    <div class="kpi ${seasons ? "expandable" : ""}">
      <div class="kpi-label">${escapeHtml(label)}</div>
      <div class="kpi-value">${fact} <span class="small">/ ${plan}</span></div>
      ${seasonsBlock}
    </div>
  `;
}

function seasonRow(label, s) {
  const conv = `${s.conversion}%`;
  return `<div class="kpi-seasons-row"><span>${label}</span><span><b>${s.fact}</b> / ${s.plan} · ${conv}</span></div>`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
