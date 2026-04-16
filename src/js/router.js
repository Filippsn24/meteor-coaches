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

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", dispatch);
}

export function onRoute(fn) {
  listeners.push(fn);
  dispatch();
}
