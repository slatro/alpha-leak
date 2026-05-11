import crypto from "crypto";
import { json, readJson } from "../_lib/http.js";
import { storage } from "../_lib/storage.js";

export default async function handler(event) {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  const { address } = await readJson(event);
  if (!/^0x[a-fA-F0-9]{40}$/.test(String(address || "").trim())) return json(400, { error: "Invalid wallet address" });
  const nonce = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + (1000 * 60 * 10);
  await storage.storeNonce(address, nonce, expiresAt);
  const message = `Alpha Leak login\nAddress: ${address}\nNonce: ${nonce}\nIssued: ${new Date().toISOString()}`;
  return json(200, { nonce, message, expiresAt });
}
