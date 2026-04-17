import { renderHome } from "./render-home.js";
import { renderCoach } from "./render-coach.js";
import { renderRating } from "./render-rating.js";
import { onRoute } from "./router.js";

const root = document.getElementById("app");

onRoute((route) => {
  if (route.name === "home") renderHome(root);
  else if (route.name === "coach") renderCoach(root, route.slug);
  else if (route.name === "rating") renderRating(root);
});
