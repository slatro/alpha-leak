import crypto from "crypto";
import { env } from "./env.js";

const COOKIE_NAME = "alpha_leak_session";

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function parseCookieHeader(header = "") {
  return Object.fromEntries(
    String(header || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [part.slice(0, index), part.slice(index + 1)];
      })
  );
}

function sign(payload) {
  const secret = env("SESSION_SECRET", "alpha-leak-dev-secret");
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionCookie(data) {
  const payload = {
    sub: data.userId,
    address: data.address,
    walletName: data.walletName,
    iat: Date.now(),
    exp: Date.now() + (1000 * 60 * 60 * 24 * 30),
  };
  const encoded = base64url(JSON.stringify(payload));
  const token = `${encoded}.${sign(encoded)}`;
  const secure = env("NODE_ENV") === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`;
}

export function clearSessionCookie() {
  const secure = env("NODE_ENV") === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function getSession(event) {
  const header = event.headers?.cookie || event.headers?.Cookie || "";
  const token = parseCookieHeader(header)[COOKIE_NAME];
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || sign(encoded) !== signature) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
