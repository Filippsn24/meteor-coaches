import { checkPassword, setAuthenticated } from "./auth.js";
import { PASSWORD_HASH } from "./config.js";

export function renderLogin(root, onSuccess) {
  root.innerHTML = `
    <main class="login">
      <div class="login-box">
        <img src="assets/logo.png" alt="Метеор Москва" class="login-logo">
        <h1 class="login-title">МЕТЕОР МОСКВА</h1>
        <form id="login-form">
          <label for="login-password" class="visually-hidden">Пароль</label>
          <input type="password" id="login-password" name="password" placeholder="Пароль" autocomplete="current-password" required autofocus>
          <button type="submit">Войти</button>
          <div class="error" id="login-error" role="alert" aria-live="polite"></div>
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
