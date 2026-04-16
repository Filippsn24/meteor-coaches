import { fetchCoaches } from "./data.js";
import { CSV_URL, SEASON_LABEL } from "./config.js";
import { navigate } from "./router.js";

let cache = null;

async function getCoaches() {
  if (cache) return cache;
  cache = await fetchCoaches(CSV_URL);
  return cache;
}

export function clearCoachesCache() { cache = null; }

export async function renderHome(root) {
  root.innerHTML = `
    <header class="header">
      <div class="header-brand">
        <img src="assets/logo.svg" alt="" class="header-logo">
        <div class="header-title">ТРЕНЕРСКИЙ СОСТАВ</div>
      </div>
      <div class="header-season">СЕЗОН ${SEASON_LABEL}</div>
    </header>
    <div class="search-bar">
      <input type="search" id="search" placeholder="Поиск по фамилии..." autocomplete="off">
    </div>
    <section class="grid" id="grid">Загрузка…</section>
  `;
  let coaches;
  try {
    coaches = await getCoaches();
  } catch (e) {
    root.querySelector("#grid").innerHTML = `<p style="grid-column:1/-1;color:#ff6b6b;">Не удалось загрузить данные: ${e.message}</p>`;
    return;
  }
  const grid = root.querySelector("#grid");
  const search = root.querySelector("#search");

  function render(filter = "") {
    const f = filter.trim().toLowerCase();
    const filtered = f
      ? coaches.filter((c) => c.fio.toLowerCase().includes(f))
      : coaches;
    if (filtered.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1;color:#a3a3a3;">Ничего не найдено</p>`;
      return;
    }
    grid.innerHTML = filtered.map(card).join("");
    grid.querySelectorAll(".card").forEach((el) => {
      el.addEventListener("click", () => navigate(`#/coach/${el.dataset.slug}`));
    });
  }

  function card(c) {
    return `
      <article class="card" data-slug="${c.slug}">
        <div class="card-avatar">${c.initials}</div>
        <div class="card-body">
          <div class="card-fio">${escapeHtml(c.fio)}</div>
          <div class="card-sub">${c.kids} ${pluralKids(c.kids)}</div>
        </div>
      </article>
    `;
  }

  search.addEventListener("input", (e) => render(e.target.value));
  render();
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function pluralKids(n) {
  const n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return "ребёнок";
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return "ребёнка";
  return "детей";
}
