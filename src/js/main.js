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
