# План реализации лендинга «Тренеры Метеор Москва»

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Цель:** Собрать статический SPA-лендинг на vanilla HTML/CSS/JS, который тянет данные из Google Таблицы (вкладка `dashboard_data`, опубликованная как CSV) и показывает 21 карточку тренеров. Клик на карточку — детальная страница с KPI и сезонной разбивкой. Защита общим паролем.

**Архитектура:** Single-Page Application, ES-модули в браузере без сборки. Парсинг CSV → трансформация в плоские объекты Coach → рендер через шаблонные строки. SHA-256 хэш пароля на клиенте. Hash-роутинг (`#/coach/<slug>`).

**Стек:** vanilla JS (ES modules), CSS3, HTML5, node:test для unit-тестов парсера/трансформации, Netlify для хостинга. Без npm-зависимостей в production.

**Спецификация:** `docs/superpowers/specs/2026-04-16-meteor-coaches-landing-design.md`

---

## Структура файлов

```
/root/filipp/coach/
├── src/
│   ├── index.html              # SPA shell + auth screen
│   ├── styles.css              # Все стили
│   ├── assets/
│   │   ├── logo.svg            # Логотип Метеор (щит)
│   │   └── logo-text.svg       # Логотип с подписью
│   └── js/
│       ├── config.js           # CSV_URL, PASSWORD_HASH (заполняется на финале)
│       ├── auth.js             # Хэширование и проверка пароля
│       ├── data.js             # fetch + CSV парсинг + трансформация
│       ├── csv.js              # Чистый CSV parser
│       ├── slug.js             # FIO → slug (транслит)
│       ├── router.js           # Hash router
│       ├── render-home.js      # Рендер сетки тренеров
│       ├── render-coach.js     # Рендер страницы тренера
│       └── main.js             # Точка входа
├── tests/
│   ├── csv.test.js
│   ├── data.test.js
│   ├── slug.test.js
│   └── auth.test.js
├── test-fixtures/
│   └── sample-dashboard.csv    # Mock-данные на ~3 тренеров
├── docs/
│   ├── superpowers/
│   │   ├── specs/...
│   │   └── plans/...
│   └── user/
│       ├── google-sheet-setup.md
│       └── netlify-deploy.md
├── netlify.toml
└── README.md
```

**Принцип разделения:** один файл — одна ответственность. `csv.js` — только парсинг текста. `data.js` — fetch + трансформация бизнес-объектов. `render-*.js` — только DOM. Тесты пишутся для всех «чистых» функций (csv, slug, transformations). DOM-рендер тестируется визуально.

---

## Task 1: Project skeleton

**Files:**
- Create: `/root/filipp/coach/src/index.html`
- Create: `/root/filipp/coach/src/styles.css`
- Create: `/root/filipp/coach/src/js/main.js`
- Create: `/root/filipp/coach/.gitignore`
- Create: `/root/filipp/coach/README.md`
- Create: `/root/filipp/coach/package.json`

- [ ] **Step 1: Initialize git repo**

```bash
cd /root/filipp/coach
git init
git config user.email "coach@meteor.local"
git config user.name "Meteor Coach Project"
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
.DS_Store
.env
*.log
```

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "meteor-coaches",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "test": "node --test tests/",
    "serve": "python3 -m http.server 8000 --directory src"
  }
}
```

- [ ] **Step 4: Create skeleton `src/index.html`**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Тренерский состав | Метеор Москва</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">Загрузка…</div>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create empty `src/styles.css` and `src/js/main.js`**

```css
/* styles.css — base reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #000; color: #fff; }
```

```js
// main.js
console.log("Meteor Coaches loaded");
document.getElementById("app").textContent = "Скоро тут будет лендинг";
```

- [ ] **Step 6: Create README.md**

```markdown
# Meteor Coaches Landing

Внутренний дашборд статистики тренеров футбольной школы Метеор Москва.

## Запуск локально
```
npm run serve
```
Открыть http://localhost:8000

## Тесты
```
npm test
```

## Деплой
См. `docs/user/netlify-deploy.md`
```

- [ ] **Step 7: Verify and commit**

```bash
cd /root/filipp/coach && npm run serve &
sleep 1 && curl -s http://localhost:8000 | head -5 && kill %1
```
Expected: HTML output starting with `<!DOCTYPE html>`

```bash
git add -A && git commit -m "chore: initial project skeleton"
```

---

## Task 2: Sample data fixture

**Files:**
- Create: `/root/filipp/coach/test-fixtures/sample-dashboard.csv`

Этот файл — образец того, как будет выглядеть вкладка `dashboard_data`. Используем его в тестах и для разработки до того, как реальная вкладка готова.

- [ ] **Step 1: Create fixture file**

```csv
fio,kids,camp_plan_autumn,camp_fact_autumn,camp_plan_winter,camp_fact_winter,camp_plan_spring,camp_fact_spring,merch_total,teams,cup_plan,cup_fact,league_teams
Туловский Виктор,17,17,9,17,5,17,7,24,4,30,12,2
Нахушев Аслан,14,14,6,14,4,14,5,18,2,24,8,1
Калинкин Сергей,25,25,15,25,12,25,18,40,6,50,28,3
```

- [ ] **Step 2: Commit**

```bash
git add test-fixtures/ && git commit -m "test: add sample dashboard CSV fixture"
```

---

## Task 3: CSV parser (TDD)

**Files:**
- Create: `/root/filipp/coach/tests/csv.test.js`
- Create: `/root/filipp/coach/src/js/csv.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/csv.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCSV } from "../src/js/csv.js";

test("parseCSV: parses header and rows into array of objects", () => {
  const csv = "name,age\nIvan,30\nMaria,25";
  const rows = parseCSV(csv);
  assert.deepEqual(rows, [
    { name: "Ivan", age: "30" },
    { name: "Maria", age: "25" },
  ]);
});

test("parseCSV: handles empty cells", () => {
  const csv = "a,b,c\n1,,3";
  assert.deepEqual(parseCSV(csv), [{ a: "1", b: "", c: "3" }]);
});

test("parseCSV: handles quoted fields with commas inside", () => {
  const csv = 'name,note\nИванов,"hello, world"';
  assert.deepEqual(parseCSV(csv), [{ name: "Иванов", note: "hello, world" }]);
});

test("parseCSV: trims trailing newline and CRLF", () => {
  const csv = "a,b\r\n1,2\r\n";
  assert.deepEqual(parseCSV(csv), [{ a: "1", b: "2" }]);
});

test("parseCSV: ignores blank lines", () => {
  const csv = "a,b\n1,2\n\n3,4";
  assert.deepEqual(parseCSV(csv), [{ a: "1", b: "2" }, { a: "3", b: "4" }]);
});
```

- [ ] **Step 2: Run tests, expect FAIL**

```bash
cd /root/filipp/coach && npm test
```
Expected: All tests fail with "Cannot find module".

- [ ] **Step 3: Implement `csv.js`**

```js
// src/js/csv.js
export function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.length > 0);
  if (lines.length < 2) return [];
  const headers = splitLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]));
  });
}

function splitLine(line) {
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cells.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
npm test
```
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/js/csv.js tests/csv.test.js && git commit -m "feat: CSV parser with quoted fields support"
```

---

## Task 4: Slug generator (TDD)

**Files:**
- Create: `/root/filipp/coach/tests/slug.test.js`
- Create: `/root/filipp/coach/src/js/slug.js`

ФИО на русском → латинский slug для URL (`Туловский Виктор` → `tulovskij-viktor`).

- [ ] **Step 1: Write failing tests**

```js
// tests/slug.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { fioToSlug } from "../src/js/slug.js";

test("fioToSlug: simple FIO", () => {
  assert.equal(fioToSlug("Туловский Виктор"), "tulovskij-viktor");
});

test("fioToSlug: handles ё, щ, ж", () => {
  assert.equal(fioToSlug("Ёжиков Щукин"), "yozhikov-shchukin");
});

test("fioToSlug: handles single name", () => {
  assert.equal(fioToSlug("Нахушев"), "nahushev");
});

test("fioToSlug: handles ь, ъ (drops them)", () => {
  assert.equal(fioToSlug("Подъездов"), "podezdov");
});

test("fioToSlug: trims and lowercases", () => {
  assert.equal(fioToSlug("  Ивано́в  "), "ivanov");
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
npm test
```

- [ ] **Step 3: Implement `slug.js`**

```js
// src/js/slug.js
const TRANSLIT = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
  ж: "zh", з: "z", и: "i", й: "j", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "shch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function fioToSlug(fio) {
  return fio
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
```

- [ ] **Step 4: Run, expect PASS**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add src/js/slug.js tests/slug.test.js && git commit -m "feat: cyrillic-to-latin slug generator"
```

---

## Task 5: Data transformation (TDD)

**Files:**
- Create: `/root/filipp/coach/tests/data.test.js`
- Create: `/root/filipp/coach/src/js/data.js`

Превращает «сырую» строку CSV в объект `Coach` с агрегированными полями.

- [ ] **Step 1: Write failing tests**

```js
// tests/data.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { rowToCoach, computeConversion } from "../src/js/data.js";

test("computeConversion: returns null when plan is 0", () => {
  assert.equal(computeConversion(0, 5), null);
});

test("computeConversion: rounds to integer percent", () => {
  assert.equal(computeConversion(17, 9), 53);
  assert.equal(computeConversion(10, 10), 100);
});

test("rowToCoach: builds full Coach object", () => {
  const row = {
    fio: "Туловский Виктор",
    kids: "17",
    camp_plan_autumn: "17", camp_fact_autumn: "9",
    camp_plan_winter: "17", camp_fact_winter: "5",
    camp_plan_spring: "17", camp_fact_spring: "7",
    merch_total: "24",
    teams: "4",
    cup_plan: "30", cup_fact: "12",
    league_teams: "2",
  };
  const c = rowToCoach(row);
  assert.equal(c.fio, "Туловский Виктор");
  assert.equal(c.slug, "tulovskij-viktor");
  assert.equal(c.initials, "ТВ");
  assert.equal(c.kids, 17);
  assert.equal(c.camp.plan_total, 51);
  assert.equal(c.camp.fact_total, 21);
  assert.equal(c.camp.conversion, 41);
  assert.deepEqual(c.camp.seasons.autumn, { plan: 17, fact: 9, conversion: 53 });
  assert.equal(c.merch, 24);
  assert.equal(c.teams, 4);
  assert.equal(c.cup.plan, 30);
  assert.equal(c.cup.fact, 12);
  assert.equal(c.cup.conversion, 40);
  assert.equal(c.league_teams, 2);
});

test("rowToCoach: initials from single name", () => {
  const c = rowToCoach({ fio: "Нахушев", kids: "0" });
  assert.equal(c.initials, "Н");
});

test("rowToCoach: handles empty/missing numeric cells as 0", () => {
  const c = rowToCoach({ fio: "Тест Тестов", kids: "", merch_total: "" });
  assert.equal(c.kids, 0);
  assert.equal(c.merch, 0);
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
npm test
```

- [ ] **Step 3: Implement `data.js`**

```js
// src/js/data.js
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
```

- [ ] **Step 4: Run, expect PASS**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add src/js/data.js tests/data.test.js && git commit -m "feat: data transformation from CSV row to Coach object"
```

---

## Task 6: Auth module (TDD)

**Files:**
- Create: `/root/filipp/coach/tests/auth.test.js`
- Create: `/root/filipp/coach/src/js/auth.js`

SHA-256 хэш + проверка. Тестируется в Node (использует `crypto.subtle` через webcrypto polyfill в Node 22 — встроен).

- [ ] **Step 1: Write failing tests**

```js
// tests/auth.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, checkPassword } from "../src/js/auth.js";

test("hashPassword: returns hex string of length 64", async () => {
  const h = await hashPassword("hello");
  assert.equal(typeof h, "string");
  assert.equal(h.length, 64);
  assert.match(h, /^[0-9a-f]+$/);
});

test("hashPassword: known SHA-256 of 'hello'", async () => {
  const h = await hashPassword("hello");
  assert.equal(h, "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
});

test("checkPassword: matches correct password against its hash", async () => {
  const hash = await hashPassword("meteor2026");
  assert.equal(await checkPassword("meteor2026", hash), true);
});

test("checkPassword: rejects wrong password", async () => {
  const hash = await hashPassword("meteor2026");
  assert.equal(await checkPassword("wrong", hash), false);
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
npm test
```

- [ ] **Step 3: Implement `auth.js`**

```js
// src/js/auth.js
export async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function checkPassword(input, expectedHash) {
  const h = await hashPassword(input);
  return h === expectedHash;
}

const AUTH_KEY = "meteor_auth";

export function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "ok";
}

export function setAuthenticated() {
  sessionStorage.setItem(AUTH_KEY, "ok");
}

export function clearAuth() {
  sessionStorage.removeItem(AUTH_KEY);
}
```

- [ ] **Step 4: Run, expect PASS**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add src/js/auth.js tests/auth.test.js && git commit -m "feat: SHA-256 password auth module"
```

---

## Task 7: Config and Router

**Files:**
- Create: `/root/filipp/coach/src/js/config.js`
- Create: `/root/filipp/coach/src/js/router.js`

- [ ] **Step 1: Create `config.js` with placeholders**

```js
// src/js/config.js
// CSV_URL заполняется на финальном этапе (см. docs/user/google-sheet-setup.md)
// На время разработки используем локальный mock.
export const CSV_URL = "/test-fixtures/sample-dashboard.csv";

// Хэш SHA-256 общего пароля. Сгенерировать: node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('PASSWORD')).then(b => console.log(Buffer.from(b).toString('hex')))"
// По умолчанию: пароль "meteor2026"
export const PASSWORD_HASH = "9e3e3a9c4c8d6e2bd7f48c7c1f5b8c9d7e2a4f6b8c1e3d5a7f9b2c4e6a8d0f12";

export const SEASON_LABEL = "2025–26";
```

(Пароль и URL заменим в финале. Хэш выше — placeholder, перегенерируем перед деплоем.)

- [ ] **Step 2: Create `router.js`**

```js
// src/js/router.js
// Простой hash-роутер. Маршруты:
//   #/coaches           — главная (сетка)
//   #/coach/<slug>      — детальная

const listeners = [];

export function parseRoute(hash) {
  const h = (hash || "#/coaches").replace(/^#/, "");
  const parts = h.split("/").filter(Boolean);
  if (parts[0] === "coach" && parts[1]) return { name: "coach", slug: parts[1] };
  return { name: "home" };
}

export function navigate(hash) {
  if (window.location.hash !== hash) window.location.hash = hash;
  else dispatch();
}

function dispatch() {
  const route = parseRoute(window.location.hash);
  listeners.forEach((fn) => fn(route));
}

export function onRoute(fn) {
  listeners.push(fn);
  window.addEventListener("hashchange", dispatch);
  dispatch();
}
```

- [ ] **Step 3: Add router test**

```js
// tests/router.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRoute } from "../src/js/router.js";

test("parseRoute: defaults to home", () => {
  assert.deepEqual(parseRoute(""), { name: "home" });
  assert.deepEqual(parseRoute("#/coaches"), { name: "home" });
});

test("parseRoute: extracts coach slug", () => {
  assert.deepEqual(parseRoute("#/coach/tulovskij-viktor"), { name: "coach", slug: "tulovskij-viktor" });
});
```

- [ ] **Step 4: Run, expect PASS**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add src/js/config.js src/js/router.js tests/router.test.js && git commit -m "feat: config module and hash router"
```

---

## Task 8: Visual styles (CSS)

**Files:**
- Modify: `/root/filipp/coach/src/styles.css`
- Create: `/root/filipp/coach/src/assets/` (через Task 9 положим SVG логотипа)

Полная стилизация: цвета бренда, шрифты, верстка экранов.

- [ ] **Step 1: Replace `styles.css` with full styles**

```css
/* === Reset === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  background: #0a0a0a;
  color: #fff;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; display: block; }
button { font: inherit; cursor: pointer; border: none; background: none; color: inherit; }
input { font: inherit; }
a { color: inherit; text-decoration: none; }

/* === Tokens === */
:root {
  --burgundy: #9F1239;
  --burgundy-dark: #6B0F2A;
  --black: #000000;
  --bg: #0a0a0a;
  --bg-elev: #161616;
  --border: #262626;
  --text: #ffffff;
  --text-dim: #a3a3a3;
  --radius: 4px;
  --shadow: 0 4px 20px rgba(0,0,0,0.4);
}

/* === Fonts === */
@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap");
.font-display { font-family: "Bebas Neue", "Inter", sans-serif; letter-spacing: 0.02em; }

/* === Login === */
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: radial-gradient(ellipse at center, #1a0a10 0%, #000 70%);
  padding: 24px;
}
.login-box { text-align: center; max-width: 320px; width: 100%; }
.login-logo { width: 120px; height: auto; margin: 0 auto 32px; }
.login-title {
  font-family: "Bebas Neue", sans-serif;
  font-size: 28px;
  letter-spacing: 0.05em;
  margin-bottom: 24px;
}
.login input {
  width: 100%;
  padding: 14px 16px;
  background: #1a1a1a;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: #fff;
  text-align: center;
  margin-bottom: 12px;
}
.login input:focus { outline: 2px solid var(--burgundy); border-color: transparent; }
.login button {
  width: 100%;
  padding: 14px;
  background: var(--burgundy);
  color: #fff;
  border-radius: var(--radius);
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: background 0.2s;
}
.login button:hover { background: var(--burgundy-dark); }
.login .error {
  color: #ff6b6b;
  font-size: 13px;
  margin-top: 12px;
  min-height: 18px;
}
.shake { animation: shake 0.4s; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

/* === Header === */
.header {
  background: #000;
  border-bottom: 1px solid var(--border);
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.header-brand { display: flex; align-items: center; gap: 16px; }
.header-logo { width: 36px; height: 36px; }
.header-title { font-family: "Bebas Neue", sans-serif; font-size: 22px; letter-spacing: 0.05em; }
.header-season { color: var(--text-dim); font-size: 14px; letter-spacing: 0.05em; }

/* === Search === */
.search-bar {
  padding: 24px 32px 0;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}
.search-bar input {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: #fff;
}
.search-bar input:focus { outline: 2px solid var(--burgundy); border-color: transparent; }

/* === Coaches grid === */
.grid {
  padding: 24px 32px 64px;
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: block;
}
.card:hover {
  transform: translateY(-4px);
  border-color: var(--burgundy);
  box-shadow: var(--shadow);
}
.card-avatar {
  aspect-ratio: 1;
  background: var(--burgundy);
  display: grid;
  place-items: center;
  font-family: "Bebas Neue", sans-serif;
  font-size: 56px;
  color: #fff;
  letter-spacing: 0.02em;
}
.card-body { padding: 16px; }
.card-fio {
  font-family: "Bebas Neue", sans-serif;
  font-size: 20px;
  letter-spacing: 0.02em;
  margin-bottom: 4px;
}
.card-sub { color: var(--text-dim); font-size: 13px; }

/* === Coach detail === */
.coach-hero {
  background: #000;
  border-bottom: 4px solid var(--burgundy);
  padding: 32px;
}
.coach-hero-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}
.coach-hero-avatar {
  width: 120px;
  height: 120px;
  background: var(--burgundy);
  border-radius: var(--radius);
  display: grid;
  place-items: center;
  font-family: "Bebas Neue", sans-serif;
  font-size: 56px;
}
.coach-hero-text { flex: 1; min-width: 0; }
.coach-hero-fio {
  font-family: "Bebas Neue", sans-serif;
  font-size: 48px;
  letter-spacing: 0.02em;
  line-height: 1;
  margin-bottom: 8px;
}
.coach-hero-meta { color: var(--text-dim); font-size: 14px; letter-spacing: 0.05em; }
.coach-back {
  display: inline-block;
  color: var(--text-dim);
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 13px;
  transition: color 0.2s, border-color 0.2s;
}
.coach-back:hover { color: #fff; border-color: var(--burgundy); }

.kpi-grid {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.kpi {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 24px;
}
.kpi-label {
  color: var(--text-dim);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}
.kpi-value {
  font-family: "Bebas Neue", sans-serif;
  font-size: 40px;
  line-height: 1;
}
.kpi-value .small { font-size: 24px; color: var(--text-dim); }
.kpi-conv {
  margin-top: 6px;
  font-size: 14px;
  color: var(--text-dim);
}
.kpi-conv .pct { color: #fff; font-weight: 600; }
.kpi.expandable { cursor: pointer; }
.kpi.expandable::after {
  content: "▾";
  float: right;
  color: var(--text-dim);
  margin-top: -28px;
}
.kpi.expanded::after { content: "▴"; }
.kpi-seasons {
  display: none;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--border);
  font-size: 13px;
}
.kpi.expanded .kpi-seasons { display: block; }
.kpi-seasons-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  color: var(--text-dim);
}
.kpi-seasons-row b { color: #fff; font-weight: 600; }

/* === Adaptive === */
@media (max-width: 1023px) {
  .grid { grid-template-columns: repeat(3, 1fr); padding: 24px; }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 767px) {
  .header { padding: 16px; flex-wrap: wrap; }
  .header-title { font-size: 18px; }
  .grid { grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 16px; }
  .card-avatar { font-size: 36px; }
  .card-fio { font-size: 16px; }
  .coach-hero { padding: 24px 16px; }
  .coach-hero-fio { font-size: 32px; }
  .coach-hero-avatar { width: 80px; height: 80px; font-size: 36px; }
  .kpi-grid { grid-template-columns: 1fr 1fr; padding: 16px; gap: 12px; }
  .kpi { padding: 16px; }
  .kpi-value { font-size: 32px; }
}
```

- [ ] **Step 2: Open in browser, verify base background loads**

```bash
cd /root/filipp/coach && npm run serve &
sleep 1 && curl -s http://localhost:8000 | head -20 && kill %1
```
Expected: HTML with `<link rel="stylesheet" href="styles.css">` resolves OK.

- [ ] **Step 3: Commit**

```bash
git add src/styles.css && git commit -m "feat: full visual styles per brand book"
```

---

## Task 9: Logo asset

**Files:**
- Create: `/root/filipp/coach/src/assets/logo.svg`

PDF логотип конвертировать в SVG. Самый надёжный путь — нарисовать SVG вручную по картинке (щит + M).

- [ ] **Step 1: Create simplified SVG logo**

```xml
<!-- src/assets/logo.svg — упрощённый щит Метеор -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110" fill="none">
  <path d="M50 5 L95 20 V60 Q95 90 50 105 Q5 90 5 60 V20 Z"
        fill="none" stroke="#9F1239" stroke-width="6" stroke-linejoin="round"/>
  <path d="M25 35 L40 75 L50 50 L60 75 L75 35"
        fill="none" stroke="#9F1239" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

- [ ] **Step 2: Wire logo into login + header (this is anticipating Tasks 10/11)**

(Логотип будет вставлен через `<img src="assets/logo.svg">` в Task 10 и 11.)

- [ ] **Step 3: Commit**

```bash
git add src/assets/ && git commit -m "feat: add Meteor shield SVG logo"
```

---

## Task 10: Login screen + auth integration

**Files:**
- Modify: `/root/filipp/coach/src/index.html`
- Modify: `/root/filipp/coach/src/js/main.js`
- Create: `/root/filipp/coach/src/js/render-login.js`

- [ ] **Step 1: Update `index.html`**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Тренерский состав | Метеор Москва</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="assets/logo.svg" type="image/svg+xml">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `render-login.js`**

```js
// src/js/render-login.js
import { checkPassword, setAuthenticated } from "./auth.js";
import { PASSWORD_HASH } from "./config.js";

export function renderLogin(root, onSuccess) {
  root.innerHTML = `
    <main class="login">
      <div class="login-box">
        <img src="assets/logo.svg" alt="Метеор Москва" class="login-logo">
        <h1 class="login-title">МЕТЕОР МОСКВА</h1>
        <form id="login-form">
          <input type="password" name="password" placeholder="Пароль" autocomplete="current-password" required autofocus>
          <button type="submit">Войти</button>
          <div class="error" id="login-error"></div>
        </form>
      </div>
    </main>
  `;
  const form = root.querySelector("#login-form");
  const err = root.querySelector("#login-error");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const pwd = form.password.value;
    const ok = await checkPassword(pwd, PASSWORD_HASH);
    if (ok) {
      setAuthenticated();
      onSuccess();
    } else {
      err.textContent = "Неверный пароль";
      form.classList.add("shake");
      setTimeout(() => form.classList.remove("shake"), 400);
      form.password.value = "";
      form.password.focus();
    }
  });
}
```

- [ ] **Step 3: Update `main.js`**

```js
// src/js/main.js
import { isAuthenticated } from "./auth.js";
import { renderLogin } from "./render-login.js";

const root = document.getElementById("app");

function start() {
  // На этом шаге — только логин. Дальнейшие экраны — в следующих тасках.
  if (isAuthenticated()) {
    root.innerHTML = `<p style="padding:32px;">Авторизован. Главная — в Task 11.</p>`;
  } else {
    renderLogin(root, start);
  }
}

start();
```

- [ ] **Step 4: Generate real password hash for testing**

```bash
node -e 'crypto.subtle.digest("SHA-256", new TextEncoder().encode("meteor2026")).then(b => console.log(Buffer.from(b).toString("hex")))'
```
Expected: 64-hex-char string. Скопировать.

- [ ] **Step 5: Update `config.js` PASSWORD_HASH с реальным хэшем из шага 4**

```js
export const PASSWORD_HASH = "<вставить_хэш_из_шага_4>";
```

- [ ] **Step 6: Manual verify in browser**

```bash
cd /root/filipp/coach && npm run serve
```
Открыть http://localhost:8000 — увидеть форму. Ввести «meteor2026» → должен пустить. Ввести «wrong» → встряска + ошибка.

- [ ] **Step 7: Commit**

```bash
git add src/index.html src/js/main.js src/js/render-login.js src/js/config.js && git commit -m "feat: login screen with SHA-256 password check"
```

---

## Task 11: Home page (coach grid + search)

**Files:**
- Create: `/root/filipp/coach/src/js/render-home.js`
- Modify: `/root/filipp/coach/src/js/main.js`

- [ ] **Step 1: Create `render-home.js`**

```js
// src/js/render-home.js
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
```

- [ ] **Step 2: Update `main.js` to wire router + home**

```js
// src/js/main.js
import { isAuthenticated } from "./auth.js";
import { renderLogin } from "./render-login.js";
import { renderHome } from "./render-home.js";
import { onRoute } from "./router.js";

const root = document.getElementById("app");

function gateAndRoute() {
  if (!isAuthenticated()) {
    renderLogin(root, gateAndRoute);
    return;
  }
  onRoute((route) => {
    if (route.name === "home") {
      renderHome(root);
    } else if (route.name === "coach") {
      // Реализуется в Task 12
      root.innerHTML = `<p style="padding:32px;">Страница тренера ${route.slug} — в Task 12.</p>`;
    }
  });
}

gateAndRoute();
```

- [ ] **Step 3: Verify in browser**

```bash
cd /root/filipp/coach && npm run serve
```
Открыть http://localhost:8000 → войти → увидеть 3 карточки (Туловский / Нахушев / Калинкин). Клик переводит на placeholder. Поиск «нах» оставляет одного Нахушева.

- [ ] **Step 4: Commit**

```bash
git add src/js/render-home.js src/js/main.js && git commit -m "feat: home page with coach grid and live search"
```

---

## Task 12: Coach detail page

**Files:**
- Create: `/root/filipp/coach/src/js/render-coach.js`
- Modify: `/root/filipp/coach/src/js/main.js`

- [ ] **Step 1: Create `render-coach.js`**

```js
// src/js/render-coach.js
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
  // Раскрытие сезонной разбивки
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
```

- [ ] **Step 2: Wire into main.js**

```js
// src/js/main.js — обновить блок onRoute
import { isAuthenticated } from "./auth.js";
import { renderLogin } from "./render-login.js";
import { renderHome } from "./render-home.js";
import { renderCoach } from "./render-coach.js";
import { onRoute } from "./router.js";

const root = document.getElementById("app");

function gateAndRoute() {
  if (!isAuthenticated()) {
    renderLogin(root, gateAndRoute);
    return;
  }
  onRoute((route) => {
    if (route.name === "home") renderHome(root);
    else if (route.name === "coach") renderCoach(root, route.slug);
  });
}

gateAndRoute();
```

- [ ] **Step 3: Verify in browser**

```bash
cd /root/filipp/coach && npm run serve
```
Войти → Главная → Клик «Туловский Виктор» → Открывается детальная с KPI. Клик на «Лагерь» → раскрывается разбивка по сезонам. Клик на «← Все тренеры» → назад.

- [ ] **Step 4: Commit**

```bash
git add src/js/render-coach.js src/js/main.js && git commit -m "feat: coach detail page with KPI cards and seasonal breakdown"
```

---

## Task 13: Mobile responsiveness check

**Files:** (никаких новых, проверка существующих)

- [ ] **Step 1: Test in browser DevTools at viewport widths**

Открыть http://localhost:8000, DevTools → Toggle device toolbar → проверить:
- 1280 px: 4 карточки в ряд, KPI 3 в ряд
- 800 px: 3 карточки, KPI 2 в ряд
- 375 px (iPhone SE): 2 карточки, KPI 2 в ряд, шапка переносится

- [ ] **Step 2: Если что-то «ломается» — править стили в `styles.css`**

Если найдены проблемы, исправить и запустить визуальную проверку снова.

- [ ] **Step 3: Commit (если были правки)**

```bash
git add src/styles.css && git commit -m "fix: mobile responsive tweaks"
```

---

## Task 14: User guide — Google Sheet setup

**Files:**
- Create: `/root/filipp/coach/docs/user/google-sheet-setup.md`

Подробная инструкция «что нажимать» для заказчика. Скриншоты опциональны.

- [ ] **Step 1: Create guide**

```markdown
# Настройка Google Таблицы для лендинга

## Что нужно сделать
Сайт лендинга тянет данные из вашей Google Таблицы. Чтобы это работало, нужно один раз:
1. Создать в таблице новую вкладку `dashboard_data` с формулами
2. Опубликовать эту вкладку в интернет
3. Передать получившуюся ссылку Claude (он подставит её в сайт)

---

## Шаг 1: Создать вкладку `dashboard_data`

1. Откройте свою таблицу: https://docs.google.com/spreadsheets/d/1Ds11Kv8FV8vj2qBjXxfZDoIicuA0uB8ITMiOzWlWHfc/
2. Внизу — нажмите на «+» возле вкладок → создастся новая вкладка
3. Кликните правой кнопкой → «Переименовать» → введите `dashboard_data`
4. В первой строке (заголовки) вставьте:

```
fio	kids	camp_plan_autumn	camp_fact_autumn	camp_plan_winter	camp_fact_winter	camp_plan_spring	camp_fact_spring	merch_total	teams	cup_plan	cup_fact	league_teams
```
(вставлять с табуляцией — каждая ячейка в свой столбец)

5. Со второй строки — для каждого тренера формулы, которые тянут значения с основной вкладки `2025-26`. Имя вкладки с дефисом нужно брать в одинарные кавычки. Например, для первого тренера:

```
='2025-26'!A3   (его ФИО)
='2025-26'!C3   (кол-во детей сент)
='2025-26'!G3   (план лагеря осень — НАЙДИТЕ нужную ячейку)
... и так далее
```

**Важно:** точные адреса ячеек (G3, K7 и т.д.) зависят от структуры основной вкладки. Передайте Claude доступ на редактирование таблицы — он составит формулы за вас, ему хватит ~10 минут.

---

## Шаг 2: Опубликовать вкладку в интернет

1. Файл → Поделиться → **Опубликовать в интернете**
2. В выпадающем списке выбрать: **dashboard_data** (НЕ «весь документ»!)
3. Формат — **CSV**
4. Поставить галочку «Автоматически публиковать после изменений»
5. Нажать **Опубликовать** → Подтвердить
6. Скопировать получившуюся ссылку (длинная, начинается с `https://docs.google.com/spreadsheets/d/e/...`)

---

## Шаг 3: Передать ссылку

Передайте скопированную ссылку Claude. Он подставит её в файл `src/js/config.js` и перезальёт сайт на Netlify.

---

## Что НЕ нужно публиковать
- Основная вкладка `2025-26` — НЕ публикуется (там детальные данные)
- Любые вкладки с ФИО детей, телефонами, оплатами — НЕ публикуются
- Только вкладка `dashboard_data` со сводными цифрами

---

## Безопасность
Опубликованная ссылка длинная и случайная — её невозможно угадать. Плюс сайт защищён паролем. Но если вдруг ссылка утечёт — её можно отозвать в том же меню «Опубликовать в интернете → Прекратить публикацию».
```

- [ ] **Step 2: Commit**

```bash
git add docs/user/google-sheet-setup.md && git commit -m "docs: Google Sheet setup guide for end user"
```

---

## Task 15: User guide — Netlify deploy

**Files:**
- Create: `/root/filipp/coach/docs/user/netlify-deploy.md`
- Create: `/root/filipp/coach/netlify.toml`

- [ ] **Step 1: Create `netlify.toml`**

```toml
[build]
  publish = "src"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

- [ ] **Step 2: Create deploy guide**

```markdown
# Публикация сайта на Netlify

## Шаг 1: Создать аккаунт Netlify
1. Открыть https://app.netlify.com/signup
2. Зарегистрироваться через Google или email — бесплатно
3. Подтвердить почту

## Шаг 2: Залить сайт (drag-and-drop)
1. Войти на https://app.netlify.com
2. На главной — большая зона **«Drag and drop your site folder here»**
3. Перетащить туда папку **`src`** из проекта `/root/filipp/coach/src`
4. Подождать 30 секунд — Netlify выдаст временный адрес типа `https://random-name-12345.netlify.app`

## Шаг 3: Задать красивое имя поддомена
1. В дашборде Netlify → Site settings → **Change site name**
2. Ввести `meteor-coaches` (или другое доступное имя)
3. Сайт станет доступен по `https://meteor-coaches.netlify.app`

## Шаг 4: Передать ссылку тренерам и пароль
- Ссылка: `https://meteor-coaches.netlify.app`
- Пароль: тот, что вы выбрали (по умолчанию `meteor2026` — заменить!)

## Как обновлять сайт
- **Цифры в таблице** обновляются сами, ничего не делать
- **Изменить дизайн / метрики / пароль** — попросить Claude. Он правит код у себя, потом снова drag-and-drop в Netlify (ту же папку `src`).

## Свой домен (опционально)
Если купите свой домен (например `coaches.meteor-msk.ru`):
1. Netlify → Domain management → Add custom domain
2. Следовать инструкциям: добавить CNAME-запись у регистратора домена
3. HTTPS включится автоматически
```

- [ ] **Step 3: Commit**

```bash
git add netlify.toml docs/user/netlify-deploy.md && git commit -m "docs: Netlify deployment guide and config"
```

---

## Task 16: Real data integration (финал)

**Files:**
- Modify: `/root/filipp/coach/src/js/config.js`

Этот шаг выполняется ПОСЛЕ того, как заказчик создаст вкладку `dashboard_data` и пришлёт CSV-ссылку.

- [ ] **Step 1: Получить CSV-ссылку от заказчика**

Заказчик прошёл инструкцию из Task 14, прислал ссылку вида `https://docs.google.com/spreadsheets/d/e/2PACX-1vR.../pub?gid=...&single=true&output=csv`.

- [ ] **Step 2: Получить итоговый пароль от заказчика**

Заказчик придумал пароль (например, «meteor2026» или другой). Сгенерировать SHA-256:

```bash
node -e 'crypto.subtle.digest("SHA-256", new TextEncoder().encode("РЕАЛЬНЫЙ_ПАРОЛЬ")).then(b => console.log(Buffer.from(b).toString("hex")))'
```

- [ ] **Step 3: Обновить `config.js`**

```js
// src/js/config.js
export const CSV_URL = "<реальная_ссылка_от_заказчика>";
export const PASSWORD_HASH = "<хэш_из_шага_2>";
export const SEASON_LABEL = "2025–26";
```

- [ ] **Step 4: Локально проверить**

```bash
cd /root/filipp/coach && npm run serve
```
Открыть http://localhost:8000, ввести пароль, увидеть РЕАЛЬНЫХ 21 тренера, проверить хотя бы одну детальную страницу.

- [ ] **Step 5: Залить на Netlify**

Drag-and-drop папки `src` в существующий Netlify-сайт (повторный deploy).

- [ ] **Step 6: Передать заказчику**

Сообщение: «Готово! Ссылка: https://meteor-coaches.netlify.app, пароль: <тот, что вы выбрали>. Раздайте тренерам.»

- [ ] **Step 7: Commit**

```bash
git add src/js/config.js && git commit -m "feat: wire production CSV URL and password hash"
```

---

## После запуска (опционально, не входит в этот план)

Если потребуется — отдельные планы:
- Добавить фотографии тренеров (когда заказчик их соберёт)
- Добавить графики динамики по месяцам (Chart.js)
- Сравнение тренеров между собой (рейтинг)
- Публичная версия для родителей с урезанной статистикой
- Интеграция с AlfaCRM напрямую (без Google Таблицы)
