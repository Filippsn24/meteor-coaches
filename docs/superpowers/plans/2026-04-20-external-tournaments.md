# Внешние турниры — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить колонку «Турниры» в рейтинг тренеров — баллы за результаты внешних турниров, нормализованные к шкале 0–5.

**Architecture:** Одна новая колонка `Турниры_баллы` в CSV. Парсинг в `data.js`, нормализация там же рядом с остальными категориями. Отображение в `render-rating.js` и `render-coach.js`.

**Tech Stack:** Vanilla JS, Node.js test runner

---

### Task 1: Добавить колонку в CSV-фикстуру и парсинг

**Files:**
- Modify: `test-fixtures/sample-dashboard.csv`
- Modify: `src/js/data.js:22-98` (функция `rowToCoach`)
- Modify: `tests/data.test.js`

- [ ] **Step 1: Добавить колонку `Турниры_баллы` в CSV-фикстуру**

В `test-fixtures/sample-dashboard.csv` добавить колонку `Турниры_баллы` в конец каждой строки:

Строка 1 (заголовок): добавить `,Турниры_баллы`
Строка 2 (Туловский): добавить `,2.5`
Строка 3 (Нахушев): добавить `,1`
Строка 4 (Калинкин): добавить `,0`
Строка 5 (пустая): добавить `,`

- [ ] **Step 2: Написать failing-тест на парсинг `tournaments`**

В `tests/data.test.js` добавить тест:

```js
test("rowToCoach: parses Турниры_баллы as tournaments", () => {
  const row = sampleRow();
  row["Турниры_баллы"] = "2.5";
  const c = rowToCoach(row);
  assert.equal(c.tournaments, 2.5);
});

test("rowToCoach: empty Турниры_баллы defaults to 0", () => {
  const row = sampleRow();
  row["Турниры_баллы"] = "";
  const c = rowToCoach(row);
  assert.equal(c.tournaments, 0);
});
```

- [ ] **Step 3: Запустить тест — убедиться что падает**

```bash
node --test tests/data.test.js
```

Ожидаем: FAIL — `c.tournaments` is `undefined`

- [ ] **Step 4: Добавить парсинг в `rowToCoach`**

В `src/js/data.js`, в функции `rowToCoach`, перед `return {` добавить:

```js
const tournaments = parseFloat(String(row["Турниры_баллы"] || "0").trim().replace(",", ".")) || 0;
```

В возвращаемый объект (перед `penalty`) добавить:

```js
tournaments,
```

- [ ] **Step 5: Запустить тест — убедиться что проходит**

```bash
node --test tests/data.test.js
```

Ожидаем: все тесты PASS

- [ ] **Step 6: Коммит**

```bash
git add test-fixtures/sample-dashboard.csv src/js/data.js tests/data.test.js
git commit -m "feat: parse Турниры_баллы column from CSV"
```

---

### Task 2: Добавить `tournaments` в расчёт рейтинга

**Files:**
- Modify: `src/js/data.js:100-143` (функция `calculateRatings`)
- Modify: `tests/data.test.js`

- [ ] **Step 1: Написать failing-тест на нормализацию tournaments**

В `tests/data.test.js` добавить:

```js
import { rowToCoach, calculateRatings, parsePercent, parseNum } from "../src/js/data.js";
```

(добавить `calculateRatings` в существующий import)

Затем тест:

```js
test("calculateRatings: tournaments normalized to 0-5 scale", () => {
  const rows = [
    { ...sampleRow(), "ФИО": "Тренер А", "Турниры_баллы": "3" },
    { ...sampleRow(), "ФИО": "Тренер Б", "Турниры_баллы": "1.5" },
    { ...sampleRow(), "ФИО": "Тренер В", "Турниры_баллы": "0" },
  ];
  const coaches = rows.map(rowToCoach);
  calculateRatings(coaches);
  assert.equal(coaches[0].rating.scores.tournaments, 5);    // лучший = 5
  assert.equal(coaches[1].rating.scores.tournaments, 2.5);  // половина = 2.5
  assert.equal(coaches[2].rating.scores.tournaments, 0);    // ноль = 0
});

test("calculateRatings: tournaments included in total", () => {
  const rows = [
    { ...sampleRow(), "ФИО": "Тренер А", "Турниры_баллы": "3" },
  ];
  const coaches = rows.map(rowToCoach);
  calculateRatings(coaches);
  const s = coaches[0].rating.scores;
  const expectedBonus = s.camp + s.merch + s.cup + s.league + s.teams + s.tournaments + s.content;
  const expectedTotal = +(expectedBonus - coaches[0].penalty).toFixed(1);
  assert.equal(coaches[0].rating.total, expectedTotal);
});
```

- [ ] **Step 2: Запустить тест — убедиться что падает**

```bash
node --test tests/data.test.js
```

Ожидаем: FAIL — `scores.tournaments` is `undefined`

- [ ] **Step 3: Добавить tournaments в `calculateRatings`**

В `src/js/data.js`, функция `calculateRatings`:

1. В объект `raw` (строка ~113) добавить:
```js
tournaments: c.tournaments,
```

2. В объект `max` (строка ~120) добавить:
```js
tournaments: Math.max(...raw.map((r) => r.tournaments), 1),
```

3. В объект `scores` (строка ~130) добавить:
```js
tournaments: +(r.tournaments / max.tournaments * 5).toFixed(1),
```

4. В строку `bonus` (строка ~138) добавить `scores.tournaments`:
```js
const bonus = scores.camp + scores.merch + scores.cup + scores.league + scores.teams + scores.tournaments + scores.content;
```

- [ ] **Step 4: Запустить тест — убедиться что проходит**

```bash
node --test tests/data.test.js
```

Ожидаем: все тесты PASS

- [ ] **Step 5: Коммит**

```bash
git add src/js/data.js tests/data.test.js
git commit -m "feat: add tournaments to rating calculation (normalized 0-5)"
```

---

### Task 3: Добавить колонку «Турниры» в рейтинговую таблицу

**Files:**
- Modify: `src/js/render-rating.js:13-20` (массив `COLUMNS`)

- [ ] **Step 1: Добавить tournaments в COLUMNS**

В `src/js/render-rating.js`, массив `COLUMNS` (строка 13), добавить после `teams` и перед `content`:

```js
{ key: "tournaments", label: "Турниры" },
```

Итоговый массив:
```js
const COLUMNS = [
  { key: "camp", label: "Лагерь" },
  { key: "merch", label: "Мерч" },
  { key: "cup", label: "Кубок" },
  { key: "league", label: "Лига" },
  { key: "teams", label: "Сборные" },
  { key: "tournaments", label: "Турниры" },
  { key: "content", label: "Контент" },
];
```

- [ ] **Step 2: Коммит**

```bash
git add src/js/render-rating.js
git commit -m "feat: add Турниры column to rating table"
```

---

### Task 4: Добавить блок турниров на страницу тренера

**Files:**
- Modify: `src/js/render-coach.js`

- [ ] **Step 1: Добавить KPI-тайл для турниров**

В `src/js/render-coach.js`, в секции `kpi-grid` (после блока «Суперлига», перед закрывающим `</section>`), добавить:

```js
${kpiTile({
  label: "Внешние турниры",
  valueHtml: `${coach.tournaments} <span class="small">баллов</span>`,
  expandable: false,
})}
```

- [ ] **Step 2: Добавить рейтинг-бар для турниров**

В секции `rating-bars` (после строки с "Играющие сборные", перед "Контент бонус") добавить:

```js
${ratingBar("Внешние турниры", coach.rating.scores.tournaments, 5)}
```

- [ ] **Step 3: Коммит**

```bash
git add src/js/render-coach.js
git commit -m "feat: show tournaments on coach detail page"
```

---

### Task 5: Обновить существующий тест на полный объект coach

**Files:**
- Modify: `tests/data.test.js`
- Modify: `test-fixtures/sample-dashboard.csv` (если ещё не сделано)

- [ ] **Step 1: Добавить `Турниры_баллы` в `sampleRow()`**

В `tests/data.test.js`, функция `sampleRow()`, добавить в объект:

```js
"Турниры_баллы": "0",
```

- [ ] **Step 2: Запустить все тесты**

```bash
node --test tests/data.test.js
```

Ожидаем: все тесты PASS

- [ ] **Step 3: Коммит**

```bash
git add tests/data.test.js
git commit -m "test: add Турниры_баллы to sampleRow fixture"
```
