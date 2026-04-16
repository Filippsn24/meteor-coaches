import { isAuthenticated } from "./auth.js";
import { renderLogin } from "./render-login.js";

const root = document.getElementById("app");

function start() {
  if (isAuthenticated()) {
    root.innerHTML = `<p style="padding:32px;">Авторизован. Главная — в Task 11.</p>`;
  } else {
    renderLogin(root, start);
  }
}

start();
