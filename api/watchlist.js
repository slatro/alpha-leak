import { json, readJson } from "./_lib/http.js";
import { getSession } from "./_lib/session.js";
import { storage } from "./_lib/storage.js";

export default async function handler(event) {
  const session = getSession(event);
  if (!session) return json(401, { error: "Unauthenticated" });
  const profile = await storage.getUserByAddress(session.address);
  if (!profile) return json(401, { error: "Profile not found" });

  if (event.httpMethod === "GET") {
    const watchlist = await storage.listWatchlist(profile.id);
    return json(200, { watchlist: watchlist.map((entry) => entry.item_id) });
  }

  const { itemId } = await readJson(event);
  if (!itemId) return json(400, { error: "Missing itemId" });

  if (event.httpMethod === "POST") {
    const watchlist = await storage.addWatchlistItem(profile.id, itemId);
    return json(200, { watchlist: watchlist.map((entry) => entry.item_id) });
  }

  if (event.httpMethod === "DELETE") {
    const watchlist = await storage.removeWatchlistItem(profile.id, itemId);
    return json(200, { watchlist: watchlist.map((entry) => entry.item_id) });
  }

  return json(405, { error: "Method not allowed" });
}
