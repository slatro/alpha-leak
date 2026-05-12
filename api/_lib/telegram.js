import { requireEnv, env } from "./env.js";

export function telegramEnv() {
  return {
    token: requireEnv("TELEGRAM_BOT_TOKEN"),
    chatId: requireEnv("TELEGRAM_CHAT_ID"),
    baseUrl: env("APP_BASE_URL", "").replace(/\/$/, ""),
  };
}

export async function telegramSendMessage({ text, disablePreview = true }) {
  const { token, chatId } = telegramEnv();
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: Boolean(disablePreview),
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(`Telegram sendMessage failed: ${response.status}`);
  }
  return payload;
}

export async function telegramSendPhoto({ photo, caption }) {
  const { token, chatId } = telegramEnv();
  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      photo,
      caption,
      disable_notification: false,
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(`Telegram sendPhoto failed: ${response.status}`);
  }
  return payload;
}

