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
