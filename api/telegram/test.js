import { json } from "../_lib/http.js";
import { telegramSendMessage } from "../_lib/telegram.js";

export default async function handler() {
  await telegramSendMessage({ text: "Alpha Leak test: bot is wired." });
  return json(200, { ok: true });
}

