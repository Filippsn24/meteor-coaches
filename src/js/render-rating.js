import { fetchCoaches } from "./data.js";
import { CSV_URL, SEASON_LABEL } from "./config.js";
import { navigate } from "./router.js";
import { hasPhoto, photoUrl } from "./avatar.js";

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
  { key: "tournaments", label: "Турниры" },
  { key: "cupWinner", label: "Победитель" },
  { key: "content", label: "Контент" },
];

export async function renderRating(root) {
  root.innerHTML = `
    <header class="header">
      <div class="header-brand">
        <img src="assets/logo.png" alt="" class="header-logo">
        <div class="header-title">РЕЙТИНГ ТРЕНЕРОВ <button class="rating-help-btn" id="rating-help-btn">?</button></div>
      </div>
      <div class="header-nav">
        <a href="#/coaches" class="nav-link">Тренеры</a>
        <a href="#/rating" class="nav-link nav-active">Рейтинг</a>
      </div>
    </header>
    <div class="header-season-bar">СЕЗОН ${SEASON_LABEL}</div>
    <section class="rating-list" id="rating-list">Загрузка…</section>
    <div class="modal-overlay" id="rating-modal">
      <div class="modal-content">
        <button class="modal-close" id="modal-close">&times;</button>
        <h2 class="modal-title">КАК СЧИТАЕТСЯ РЕЙТИНГ</h2>
        <div class="modal-body">
          <div class="modal-item"><span class="modal-num">1.</span><b>Лагерь</b> (до 5 баллов) — конверсия детей в лагерь: факт / кол-во школьников × 100%. Лучший результат = 5 баллов, остальные пропорционально.</div>
          <div class="modal-item"><span class="modal-num">2.</span><b>Мерч</b> (до 5 баллов) — продажи мерча на 10 детей в группе. Лучший результат = 5 баллов, остальные пропорционально.</div>
          <div class="modal-item"><span class="modal-num">3.</span><b>Кубок</b> (до 5 баллов) — средняя конверсия участия в Кубке Метеора по месяцам: октябрь / все дети, декабрь и апрель / школьники, февраль / садовские. Если нет детей нужной категории — месяц пропускается. Лучший результат = 5 баллов.</div>
          <div class="modal-item"><span class="modal-num">4.</span><b>Лига</b> (до 5 баллов) — количество команд в Суперлиге. Лучший результат = 5 баллов, остальные пропорционально.</div>
          <div class="modal-item"><span class="modal-num">5.</span><b>Сборные</b> (до 5 баллов) — количество играющих сборных × 1.5, максимум 5.</div>
          <div class="modal-item"><span class="modal-num">6.</span><b>Турниры</b> — баллы за результаты внешних турниров за последние выходные. Победа = 1 балл (0.5 при двух играх), ничья = 0.5. Баллы всех команд складываются.</div>
          <div class="modal-item"><span class="modal-num">7.</span><b>Победитель</b> — баллы за попадание в тройку на Кубке Метеора. 1 балл за каждое призовое место.</div>
          <div class="modal-item"><span class="modal-num">8.</span><b>Контент</b> (до 5 баллов) — бонус за контент.</div>
          <div class="modal-item"><span class="modal-num">9.</span><b>Штраф</b> — вычитается из итого за невыполнение рабочих задач.</div>
        </div>
      </div>
    </div>
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

  const modal = root.querySelector("#rating-modal");
  root.querySelector("#rating-help-btn").addEventListener("click", () => {
    modal.classList.add("modal-open");
  });
  root.querySelector("#modal-close").addEventListener("click", () => {
    modal.classList.remove("modal-open");
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("modal-open");
  });
}

function ratingRow(c, rank, activeSort) {
  const s = c.rating.scores;
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

  return `
    <div class="rating-table-row" data-slug="${c.slug}">
      <div class="rt-rank">${medal || rank}</div>
      <div class="rt-coach">
        <div class="rt-avatar">${hasPhoto(c.slug) ? `<img src="${photoUrl(c.slug)}" alt="${escapeHtml(c.fio)}">` : escapeHtml(c.initials)}</div>
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
