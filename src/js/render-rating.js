import { fetchCoaches } from "./data.js";
import { CSV_URL, SEASON_LABEL } from "./config.js";
import { navigate } from "./router.js";

let cache = null;
async function getCoaches() {
  if (cache) return cache;
  cache = await fetchCoaches(CSV_URL);
  return cache;
}

const COLUMNS = [
  { key: "camp", label: "Лагерь" },
  { key: "merch", label: "Мерч" },
  { key: "cup", label: "Кубок" },
  { key: "league", label: "Лига" },
  { key: "teams", label: "Сборные" },
  { key: "content", label: "Контент" },
];

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

  const list = root.querySelector("#rating-list");
  let activeSort = null; // null = итого, иначе ключ столбца

  function renderTable() {
    const sorted = [...coaches].sort((a, b) => {
      if (activeSort) {
        return b.rating.scores[activeSort] - a.rating.scores[activeSort];
      }
      return b.rating.total - a.rating.total;
    });

    list.innerHTML = `
      <div class="rt-header-sticky">
        <div class="rt-header">
          <div class="rt-rank"></div>
          <div class="rt-coach"></div>
          ${COLUMNS.map((col) => `<div class="rt-score-col rt-sortable${activeSort === col.key ? " rt-sort-active" : ""}" data-sort="${col.key}">${col.label}</div>`).join("")}
          <div class="rt-penalty-col">Штраф</div>
          <div class="rt-total-col rt-sortable${activeSort === null ? " rt-sort-active" : ""}" data-sort="total">Итого</div>
        </div>
      </div>
      <div class="rating-table">
        ${sorted.map((c, i) => ratingRow(c, i + 1, activeSort)).join("")}
      </div>
    `;

    list.querySelectorAll(".rating-table-row").forEach((el) => {
      el.addEventListener("click", () => navigate(`#/coach/${el.dataset.slug}`));
    });

    list.querySelectorAll(".rt-sortable").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const key = el.dataset.sort;
        if (key === "total") {
          activeSort = null;
        } else {
          activeSort = activeSort === key ? null : key;
        }
        renderTable();
      });
    });
  }

  renderTable();
}

function ratingRow(c, rank, activeSort) {
  const s = c.rating.scores;
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

  return `
    <div class="rating-table-row" data-slug="${c.slug}">
      <div class="rt-rank">${medal || rank}</div>
      <div class="rt-coach">
        <div class="rt-avatar">${escapeHtml(c.initials)}</div>
        <div class="rt-name">${escapeHtml(c.fio)}</div>
      </div>
      ${COLUMNS.map((col) => `<div class="rt-score-col${activeSort === col.key ? " rt-col-highlight" : ""}">${s[col.key]}</div>`).join("")}
      <div class="rt-penalty-col">${c.rating.penalty > 0 ? `-${c.rating.penalty}` : ""}</div>
      <div class="rt-total-col${activeSort === null ? " rt-col-highlight" : ""}">${c.rating.total}</div>
    </div>
  `;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
