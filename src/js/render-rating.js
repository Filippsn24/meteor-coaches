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
    <div class="rt-header-sticky">
      <div class="rt-header">
        <div class="rt-rank"></div>
        <div class="rt-coach"></div>
        <div class="rt-score-col">Лагерь</div>
        <div class="rt-score-col">Мерч</div>
        <div class="rt-score-col">Кубок</div>
        <div class="rt-score-col">Лига</div>
        <div class="rt-score-col">Сборные</div>
        <div class="rt-score-col">Контент</div>
        <div class="rt-penalty-col">Штраф</div>
        <div class="rt-total-col">Итого</div>
      </div>
    </div>
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
      <div class="rt-score-col">${s.camp}</div>
      <div class="rt-score-col">${s.merch}</div>
      <div class="rt-score-col">${s.cup}</div>
      <div class="rt-score-col">${s.league}</div>
      <div class="rt-score-col">${s.teams}</div>
      <div class="rt-score-col">${s.content}</div>
      <div class="rt-penalty-col">${c.rating.penalty > 0 ? `-${c.rating.penalty}` : ""}</div>
      <div class="rt-total-col">${c.rating.total}</div>
    </div>
  `;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
