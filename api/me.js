import { json } from "./_lib/http.js";
import { getSession } from "./_lib/session.js";
import { storage } from "./_lib/storage.js";

export default async function handler(event) {
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });
  const session = getSession(event);
  if (!session) return json(401, { error: "Unauthenticated" });
  const profile = await storage.getUserByAddress(session.address);
  if (!profile) return json(401, { error: "Profile not found" });
  const watchlist = await storage.listWatchlist(profile.id);
  return json(200, {
    profile,
    watchlist: watchlist.map((entry) => entry.item_id),
  });
}
