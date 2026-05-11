import { json, readJson } from "./_lib/http.js";
import { getSession } from "./_lib/session.js";
import { storage } from "./_lib/storage.js";

export default async function handler(event) {
  const session = getSession(event);
  if (!session) return json(401, { error: "Unauthenticated" });
  const profile = await storage.getUserByAddress(session.address);
  if (!profile) return json(401, { error: "Profile not found" });
  if (event.httpMethod !== "PATCH") return json(405, { error: "Method not allowed" });
  const { displayName, avatar } = await readJson(event);
  const next = await storage.updateProfile(profile.id, {
    display_name: String(displayName || profile.display_name).slice(0, 24),
    avatar: avatar || profile.avatar,
  });
  return json(200, { profile: next });
}
