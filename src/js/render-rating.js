import { fetchCoaches } from "./data.js";
import { CSV_URL, SEASON_LABEL } from "./config.js";
import { navigate } from "./router.js";

let cache = null;
async function getCoaches() {
  if (cache) return cache;
  cache = await fetchCoaches(CSV_URL);
  return cache;
}

export async function renderRating(root) {
  root.innerHTML = `
    <header class="header">
      <div class="header-brand">
        <img src="assets/logo.png" alt="" class="header-logo">
        <div class="header-title">РЕЙТИНГ ТРЕНЕРОВ</div>
      </div>
      <div class="header-nav">
        <a href="#/coaches" class="nav-link">Тренеры</a>
        <a href="#/rating" class="nav-link nav-active">Рейтинг</a>
      </div>
    </header>
    <div class="header-season-bar">СЕЗОН ${SEASON_LABEL}</div>
    <section class="rating-list" id="rating-list">Загрузка…</section>
  `;

  let coaches;
  try {
    coaches = await getCoaches();
  } catch (e) {
    root.querySelector("#rating-list").innerHTML = `<p style="color:#ff6b6b;">Ошибка: ${escapeHtml(e.message)}</p>`;
    return;
  }

  const sorted = [...coaches].sort((a, b) => b.rating.total - a.rating.total);
  const list = root.querySelector("#rating-list");

  list.innerHTML = `
    <div class="rating-table">
      ${sorted.map((c, i) => ratingRow(c, i + 1)).join("")}
    </div>
  `;

  list.querySelectorAll(".rating-table-row").forEach((el) => {
    el.addEventListener("click", () => navigate(`#/coach/${el.dataset.slug}`));
  });
}

function ratingRow(c, rank) {
  const s = c.rating.scores;
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";
  const penaltyHtml = c.rating.penalty > 0
    ? `<span class="rt-penalty">-${c.rating.penalty}</span>`
    : "";

  return `
    <div class="rating-table-row" data-slug="${c.slug}">
      <div class="rt-rank">${medal || rank}</div>
      <div class="rt-coach">
        <div class="rt-avatar">${escapeHtml(c.initials)}</div>
        <div class="rt-name">${escapeHtml(c.fio)}</div>
      </div>
      <div class="rt-bars">
        <div class="rt-bar-group">
          ${miniBar("Лагерь", s.camp, 5)}
          ${miniBar("Мерч", s.merch, 5)}
          ${miniBar("Кубок", s.cup, 5)}
          ${miniBar("Лига", s.league, 5)}
          ${miniBar("Сборные", s.teams, 5)}
        </div>
      </div>
      <div class="rt-total">
        ${c.rating.total}
        ${penaltyHtml}
      </div>
    </div>
  `;
}

function miniBar(label, value, max) {
  const pct = max > 0 ? Math.min(value / max * 100, 100) : 0;
  return `
    <div class="mini-bar">
      <span class="mini-bar-label">${label}</span>
      <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${pct}%"></div></div>
      <span class="mini-bar-val">${value}</span>
    </div>
  `;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
