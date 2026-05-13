import { json } from "./_lib/http.js";
import { env } from "./_lib/env.js";
import { telegramSendPhoto } from "./_lib/telegram.js";
import { hasSent, markSent } from "./_lib/dispatch_store.js";
import { storage } from "./_lib/storage.js";

function safeNum(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

function fmtUsdCompact(n) {
  const v = safeNum(n);
  if (!v) return "N/A";
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function computeScore(pair) {
  const vol24 = safeNum(pair?.volume?.h24);
  const vol1h = safeNum(pair?.volume?.h1);
  const liq = safeNum(pair?.liquidity?.usd);
  const buys1h = safeNum(pair?.txns?.h1?.buys);
  const sells1h = safeNum(pair?.txns?.h1?.sells);
  const pc1h = Math.abs(safeNum(pair?.priceChange?.h1));
  const ageMin = pair?.pairCreatedAt ? Math.max(1, Math.round((Date.now() - pair.pairCreatedAt) / 60000)) : 9999;
  const buyRatio = (buys1h + sells1h) > 0 ? buys1h / (buys1h + sells1h) : 0.5;

  // BASE SCORE
  let score = 35; 

  // 1. VOLUME VELOCITY (The Alpha Zone Trigger)
  // If volume is high relative to liquidity in the first 15 mins, it's a massive signal.
  const volumeToLiqRatio = liq > 0 ? vol1h / liq : 0;
  if (ageMin <= 15 && volumeToLiqRatio > 0.4) {
    score += 25; // Massive early conviction bonus
  } else if (ageMin <= 30 && volumeToLiqRatio > 0.2) {
    score += 15;
  }

  // 2. MOMENTUM SCORING
  score += Math.min(20, Math.log10(vol24 + 1) * 5);
  score += Math.min(15, Math.log10(liq + 1) * 5);
  score += Math.min(10, buys1h * 0.8);

  // 3. BUY PRESSURE
  if (buyRatio > 0.65) score += 12;
  else if (buyRatio > 0.55) score += 6;

  // 4. PENALTIES (Safety & Saturation)
  // Vertical pumps are risky, but early volatility is expected.
  if (ageMin > 15 && pc1h > 150) score -= 20; 
  else if (ageMin > 15 && pc1h > 80) score -= 10;

  // Over-saturation penalty
  if (ageMin > 360) score -= 15;
  else if (ageMin > 180) score -= 5;

  // LIQUIDITY MINIMUM SAFETY
  if (liq < 5000) score -= 20;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function freshnessLabel(pair) {
  const ageMin = pair?.pairCreatedAt ? Math.max(1, Math.round((Date.now() - pair.pairCreatedAt) / 60000)) : 9999;
  if (ageMin <= 20) return "Too Early";
  if (ageMin <= 90) return "Early";
  if (ageMin <= 180) return "Heating Up";
  if (ageMin <= 360) return "Crowded";
  return "Too Late";
}

function actionLabel(score, freshness) {
  if (score >= 88 && (freshness === "Early" || freshness === "Heating Up")) return "Act Now";
  if (score >= 78) return "Research Now";
  if (score >= 70) return "Watch";
  return "Avoid";
}

function buildDexUrl(pair) {
  const chain = pair?.chainId;
  const addr = pair?.pairAddress;
  if (!chain || !addr) return "";
  return `https://dexscreener.com/${encodeURIComponent(chain)}/${encodeURIComponent(addr)}`;
}

function buildCaption({ name, score, freshness, action, dexUrl, website, twitter, contract }) {
  const lines = [
    `ALPHA LEAK | TOKEN RADAR`,
    ``,
    `${name} — ${score}`,
    `Window: ${freshness}`,
    `Action: ${action}`,
    ``,
    `Open Links`,
    dexUrl ? `DEX: ${dexUrl}` : null,
    website ? `Website: ${website}` : null,
    twitter ? `X: ${twitter}` : null,
    contract ? `Contract: ${contract}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

async function fetchJson(url) {
  const resp = await fetch(url, { headers: { "User-Agent": "alpha-leak/1.0" } });
  if (!resp.ok) throw new Error(`Fetch failed ${resp.status}`);
  return resp.json();
}

export default async function handler(event) {
  const threshold = Number(env("TELEGRAM_SCORE_THRESHOLD", "70"));
  const baseUrl = env("APP_BASE_URL", "").replace(/\/$/, "");
  if (!baseUrl) return json(400, { error: "Missing APP_BASE_URL" });

  // Discover via Dexscreener boost feeds (lightweight and fast).
  const [latestBoosts, topBoosts, latestProfiles] = await Promise.all([
    fetchJson("https://api.dexscreener.com/token-boosts/latest/v1").catch(() => []),
    fetchJson("https://api.dexscreener.com/token-boosts/top/v1").catch(() => []),
    fetchJson("https://api.dexscreener.com/token-profiles/latest/v1").catch(() => []),
  ]);

  const rows = []
    .concat(Array.isArray(latestBoosts) ? latestBoosts : [])
    .concat(Array.isArray(topBoosts) ? topBoosts : [])
    .concat(Array.isArray(latestProfiles) ? latestProfiles : [])
    .filter(Boolean);

  const grouped = rows.reduce((acc, row) => {
    const chainId = row.chainId || row.chain || row.chain_id;
    const tokenAddress = row.tokenAddress || row.address || row.token_address;
    if (!chainId || !tokenAddress) return acc;
    acc[chainId] = acc[chainId] || [];
    if (!acc[chainId].includes(tokenAddress)) acc[chainId].push(tokenAddress);
    return acc;
  }, {});

  const tokenPairResponses = await Promise.allSettled(
    Object.entries(grouped).map(([chain, addrs]) =>
      fetchJson(`https://api.dexscreener.com/tokens/v1/${chain}/${addrs.slice(0, 60).join(",")}`)
    )
  );

  const pairs = tokenPairResponses
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value || [])
    .filter((p) => p?.pairAddress && p?.baseToken?.address);

  // Rank candidates by score and take top few to notify.
  const ranked = pairs
    .map((pair) => {
      const score = computeScore(pair);
      const freshness = freshnessLabel(pair);
      const action = actionLabel(score, freshness);
      return { pair, score, freshness, action };
    })
    .filter((x) => x.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const sent = [];

  for (const item of ranked) {
    const pair = item.pair;
    const id = `${pair.chainId}:${pair.pairAddress}`;
    const dedupeKey = `token:${id}`;
    // Avoid spamming: only one send per token/pair.
    if (await hasSent(dedupeKey)) continue;

    const name = pair.baseToken?.name || pair.baseToken?.symbol || "Token";
    const dexUrl = buildDexUrl(pair);
    const website = pair.info?.websites?.[0]?.url || "";
    const twitter = pair.info?.socials?.find((s) => s.type === "twitter")?.url || "";
    const contract = pair.baseToken?.address ? `https://etherscan.io/address/${pair.baseToken.address}` : "";
    const mcap = pair.fdv ? fmtUsdCompact(pair.fdv) : "N/A";
    const vol24h = pair.volume?.h24 ? fmtUsdCompact(pair.volume.h24) : "N/A";
    const captured = new Date().toISOString().slice(11, 16);
    const image = pair.info?.imageUrl || "";

    const cardUrl = new URL(`${baseUrl}/api/telegram/card`);
    cardUrl.searchParams.set("name", name);
    if (pair.baseToken?.symbol) cardUrl.searchParams.set("symbol", pair.baseToken.symbol);
    cardUrl.searchParams.set("score", String(item.score));
    cardUrl.searchParams.set("freshness", item.freshness);
    cardUrl.searchParams.set("action", item.action);
    cardUrl.searchParams.set("mcap", mcap);
    cardUrl.searchParams.set("vol24h", vol24h);
    cardUrl.searchParams.set("captured", captured);
    if (image) cardUrl.searchParams.set("image", image);

    const caption = buildCaption({
      name,
      score: item.score,
      freshness: item.freshness,
      action: item.action,
      dexUrl,
      website,
      twitter,
      contract,
    });

    await telegramSendPhoto({ photo: cardUrl.toString(), caption });
    
    // Record to permanent storage
    await storage.recordDiscovery({
      id,
      symbol: pair.baseToken?.symbol || "Token",
      score: item.score
    });

    await markSent(dedupeKey, { score: item.score });
    sent.push({ id: dedupeKey, name, score: item.score });
  }

  return json(200, { ok: true, sent, considered: ranked.length });
}

