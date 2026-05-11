import { verifyMessage } from "viem";
import { json, readJson } from "../_lib/http.js";
import { createSessionCookie } from "../_lib/session.js";
import { storage } from "../_lib/storage.js";

export default async function handler(event) {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  const { address, message, signature, walletName, displayName, avatar } = await readJson(event);
  const safeAddress = String(address || "").trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(safeAddress)) return json(400, { error: "Invalid wallet address" });
  if (!message || !signature) return json(400, { error: "Missing signature payload" });
  const nonceMatch = String(message).match(/Nonce:\s*([a-f0-9]+)/i);
  if (!nonceMatch) return json(400, { error: "Missing nonce in message" });
  const challenge = await storage.consumeNonce(safeAddress, nonceMatch[1]);
  if (!challenge) return json(401, { error: "Challenge expired or missing" });

  const valid = await verifyMessage({
    address: safeAddress,
    message,
    signature,
  }).catch(() => false);

  if (!valid) return json(401, { error: "Invalid signature" });

  const profile = await storage.createOrUpdateUser({
    address: safeAddress,
    walletName: walletName || "Wallet",
    displayName,
    avatar,
  });
  const watchlist = await storage.listWatchlist(profile.id);

  return json(200, {
    profile,
    watchlist: watchlist.map((entry) => entry.item_id),
  }, {
    "Set-Cookie": createSessionCookie({
      userId: profile.id,
      address: profile.address,
      walletName: profile.wallet_name,
    }),
  });
}
