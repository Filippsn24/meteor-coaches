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
