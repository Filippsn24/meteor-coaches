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
  root.innerHTML = `
    <section class="coach-hero">
      <div class="coach-hero-inner">
        <div class="coach-hero-avatar">${coach.initials}</div>
        <div class="coach-hero-text">
          <h1 class="coach-hero-fio">${escapeHtml(coach.fio)}</h1>
          <div class="coach-hero-meta">ТРЕНЕР · СЕЗОН ${SEASON_LABEL}</div>
        </div>
        <a href="#/coaches" class="coach-back">← Все тренеры</a>
      </div>
    </section>
    <section class="kpi-grid">
      ${kpiSimple("Дети в группах", coach.kids)}
      ${kpiPlanFact("Лагерь (год)", coach.camp.fact_total, coach.camp.plan_total, coach.camp.conversion, "camp", coach.camp.seasons)}
      ${kpiSimple("Мерч продано", coach.merch, "шт")}
      ${kpiSimple("Сборные команды", coach.teams)}
      ${kpiPlanFact("Кубок Метеора", coach.cup.fact, coach.cup.plan, coach.cup.conversion, "cup")}
      ${kpiSimple("Лига Метеора", coach.league_teams, "команд")}
    </section>
  `;
  root.querySelectorAll(".kpi.expandable").forEach((el) => {
    el.addEventListener("click", () => el.classList.toggle("expanded"));
  });
}

function kpiSimple(label, value, suffix = "") {
  return `
    <div class="kpi">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value}${suffix ? ` <span class="small">${suffix}</span>` : ""}</div>
    </div>
  `;
}

function kpiPlanFact(label, fact, plan, conversion, key, seasons) {
  const seasonsBlock = seasons ? `
    <div class="kpi-seasons">
      ${seasonRow("Осень", seasons.autumn)}
      ${seasonRow("Зима", seasons.winter)}
      ${seasonRow("Весна", seasons.spring)}
    </div>
  ` : "";
  return `
    <div class="kpi ${seasons ? "expandable" : ""}">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${fact} <span class="small">/ ${plan}</span></div>
      <div class="kpi-conv">конверсия: <span class="pct">${conversion === null ? "—" : conversion + "%"}</span></div>
      ${seasonsBlock}
    </div>
  `;
}

function seasonRow(label, s) {
  const conv = s.conversion === null ? "—" : s.conversion + "%";
  return `<div class="kpi-seasons-row"><span>${label}</span><span><b>${s.fact}</b> / ${s.plan} · ${conv}</span></div>`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
