import { noContent } from "../_lib/http.js";
import { clearSessionCookie } from "../_lib/session.js";

export default async function handler(event) {
  if (event.httpMethod !== "POST") return noContent();
  return noContent({ "Set-Cookie": clearSessionCookie() });
}
