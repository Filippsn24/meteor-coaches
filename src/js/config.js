// CSV_URL заполняется на финальном этапе (см. docs/user/google-sheet-setup.md)
// На время разработки используем локальный mock.
export const CSV_URL = "/test-fixtures/sample-dashboard.csv";

// Хэш SHA-256 общего пароля. Сгенерировать: node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('PASSWORD')).then(b => console.log(Buffer.from(b).toString('hex')))"
// По умолчанию: пароль "meteor2026"
export const PASSWORD_HASH = "9e3e3a9c4c8d6e2bd7f48c7c1f5b8c9d7e2a4f6b8c1e3d5a7f9b2c4e6a8d0f12";

export const SEASON_LABEL = "2025–26";
