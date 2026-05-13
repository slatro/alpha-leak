import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { env, hasSupabaseAdapter } from "./env.js";

const isVercel = Boolean(process.env.VERCEL);
const localStorePath = isVercel 
  ? path.join("/tmp", "alpha-leak-db.json")
  : path.join(process.cwd(), "db", "alpha-leak-db.json");

function nowIso() {
  return new Date().toISOString();
}

function uid() {
  return crypto.randomUUID();
}

async function readLocal() {
  try {
    return JSON.parse(await fs.readFile(localStorePath, "utf8"));
  } catch {
    return { users: [], watchlist: [], nonces: [], discoveries: [] };
  }
}

async function writeLocal(data) {
  await fs.mkdir(path.dirname(localStorePath), { recursive: true }).catch(() => {});
  await fs.writeFile(localStorePath, JSON.stringify(data, null, 2), "utf8");
}

async function supabase(pathname, options = {}) {
  const base = env("SUPABASE_URL").replace(/\/$/, "");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(`${base}/rest/v1/${pathname}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function getUserByAddressLocal(address) {
  const db = await readLocal();
  return db.users.find((user) => user.address.toLowerCase() === address.toLowerCase()) || null;
}

async function createOrUpdateUserLocal({ address, walletName, displayName, avatar }) {
  const db = await readLocal();
  let user = db.users.find((entry) => entry.address.toLowerCase() === address.toLowerCase());
  if (!user) {
    user = {
      id: uid(),
      address,
      wallet_name: walletName,
      display_name: displayName || walletName || "Operator",
      avatar: avatar || "signal",
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    db.users.push(user);
  } else {
    user.wallet_name = walletName || user.wallet_name;
    user.display_name = displayName || user.display_name;
    user.avatar = avatar || user.avatar;
    user.updated_at = nowIso();
  }
  await writeLocal(db);
  return user;
}

async function listWatchlistLocal(userId) {
  const db = await readLocal();
  return db.watchlist.filter((entry) => entry.user_id === userId).sort((a, b) => a.created_at < b.created_at ? 1 : -1);
}

async function addWatchlistItemLocal(userId, itemId) {
  const db = await readLocal();
  const exists = db.watchlist.find((entry) => entry.user_id === userId && entry.item_id === itemId);
  if (!exists) {
    db.watchlist.push({ id: uid(), user_id: userId, item_id: itemId, created_at: nowIso() });
    await writeLocal(db);
  }
  return listWatchlistLocal(userId);
}

async function removeWatchlistItemLocal(userId, itemId) {
  const db = await readLocal();
  db.watchlist = db.watchlist.filter((entry) => !(entry.user_id === userId && entry.item_id === itemId));
  await writeLocal(db);
  return listWatchlistLocal(userId);
}

async function storeNonceLocal(address, nonce, expiresAt) {
  const db = await readLocal();
  db.nonces = db.nonces.filter((entry) => entry.address.toLowerCase() !== address.toLowerCase());
  db.nonces.push({ id: uid(), address, nonce, expires_at: expiresAt });
  await writeLocal(db);
}

async function consumeNonceLocal(address, nonce) {
  const db = await readLocal();
  const entry = db.nonces.find((item) => item.address.toLowerCase() === address.toLowerCase() && item.nonce === nonce && item.expires_at > Date.now());
  db.nonces = db.nonces.filter((item) => item !== entry);
  await writeLocal(db);
  return entry;
}

async function updateProfileLocal(userId, patch) {
  const db = await readLocal();
  const user = db.users.find((entry) => entry.id === userId);
  if (!user) return null;
  user.display_name = patch.display_name ?? user.display_name;
  user.avatar = patch.avatar ?? user.avatar;
  user.updated_at = nowIso();
  await writeLocal(db);
  return user;
}

async function recordDiscoveryLocal(item) {
  const db = await readLocal();
  if (!db.discoveries) db.discoveries = [];
  
  let entry = db.discoveries.find(d => d.id === item.id);
  if (!entry) {
    entry = {
      id: item.id,
      symbol: item.symbol,
      first_seen: nowIso(),
      initial_score: item.score,
      max_score: item.score,
      last_score: item.score,
      pumps: 0,
      updated_at: nowIso()
    };
    db.discoveries.push(entry);
  } else {
    if (item.score > entry.max_score) {
      entry.pumps += 1;
      entry.max_score = item.score;
    }
    entry.last_score = item.score;
    entry.updated_at = nowIso();
  }
  await writeLocal(db);
  return entry;
}

async function listDiscoveriesLocal(limit = 100) {
  const db = await readLocal();
  return (db.discoveries || []).sort((a, b) => a.updated_at < b.updated_at ? 1 : -1).slice(0, limit);
}

async function getUserByAddressSupabase(address) {
  const rows = await supabase(`profiles?address=eq.${encodeURIComponent(address)}&limit=1&select=*`, { method: "GET" });
  return rows?.[0] || null;
}

async function createOrUpdateUserSupabase({ address, walletName, displayName, avatar }) {
  const payload = {
    address,
    wallet_name: walletName,
    display_name: displayName || walletName || "Operator",
    avatar: avatar || "signal",
    updated_at: nowIso(),
  };
  const rows = await supabase("profiles?on_conflict=address", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([payload]),
  });
  return rows?.[0] || getUserByAddressSupabase(address);
}

async function listWatchlistSupabase(userId) {
  return supabase(`watchlist?user_id=eq.${userId}&select=*&order=created_at.desc`, { method: "GET" });
}

async function addWatchlistItemSupabase(userId, itemId) {
  await supabase("watchlist?on_conflict=user_id,item_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([{ user_id: userId, item_id: itemId }]),
  });
  return listWatchlistSupabase(userId);
}

async function removeWatchlistItemSupabase(userId, itemId) {
  await supabase(`watchlist?user_id=eq.${userId}&item_id=eq.${itemId}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
  return listWatchlistSupabase(userId);
}

async function storeNonceSupabase(address, nonce, expiresAt) {
  await supabase("auth_challenges?on_conflict=address", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([{ address, nonce, expires_at: new Date(expiresAt).toISOString() }]),
  });
}

async function consumeNonceSupabase(address, nonce) {
  const rows = await supabase(`auth_challenges?address=eq.${encodeURIComponent(address)}&nonce=eq.${encodeURIComponent(nonce)}&limit=1&select=*`, { method: "GET" });
  const entry = rows?.[0];
  if (!entry) return null;
  if (new Date(entry.expires_at).getTime() < Date.now()) return null;
  await supabase(`auth_challenges?id=eq.${entry.id}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
  return entry;
}

async function updateProfileSupabase(userId, patch) {
  const rows = await supabase(`profiles?id=eq.${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ ...patch, updated_at: nowIso() }),
  });
  return rows?.[0] || null;
}

const adapter = hasSupabaseAdapter()
  ? {
      getUserByAddress: getUserByAddressSupabase,
      createOrUpdateUser: createOrUpdateUserSupabase,
      listWatchlist: listWatchlistSupabase,
      addWatchlistItem: addWatchlistItemSupabase,
      removeWatchlistItem: removeWatchlistItemSupabase,
      storeNonce: storeNonceSupabase,
      consumeNonce: consumeNonceSupabase,
      updateProfile: updateProfileSupabase,
      recordDiscovery: recordDiscoveryLocal,
      listDiscoveries: listDiscoveriesLocal,
    }
  : {
      getUserByAddress: getUserByAddressLocal,
      createOrUpdateUser: createOrUpdateUserLocal,
      listWatchlist: listWatchlistLocal,
      addWatchlistItem: addWatchlistItemLocal,
      removeWatchlistItem: removeWatchlistItemLocal,
      storeNonce: storeNonceLocal,
      consumeNonce: consumeNonceLocal,
      updateProfile: updateProfileLocal,
      recordDiscovery: recordDiscoveryLocal,
      listDiscoveries: listDiscoveriesLocal,
    };

export const storage = adapter;
