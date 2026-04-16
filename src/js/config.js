export const CSV_URL = "https://docs.google.com/spreadsheets/d/1Ds11Kv8FV8vj2qBjXxfZDoIicuA0uB8ITMiOzWlWHfc/gviz/tq?tqx=out:csv&sheet=dashboard_data";

// Хэш SHA-256 общего пароля. Сгенерировать: node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('PASSWORD')).then(b => console.log(Buffer.from(b).toString('hex')))"
// По умолчанию: пароль "meteor2026"
export const PASSWORD_HASH = "86ac5bb99bb82d2681a13275e91fbcc65eaefaa193019a3a5045c4687bbccfb6";

export const SEASON_LABEL = "2025–26";
