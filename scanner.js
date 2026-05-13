import fetch from "node-fetch";
import { MongoClient } from "mongodb";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://161.97.168.173:27017/alpha-leak";
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const APP_BASE_URL = process.env.APP_BASE_URL;

const client = new MongoClient(MONGODB_URI);

function safeNum(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
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

  let score = 35; // Alpha Zone Base

  // 1. VOLUME VELOCITY (The Alpha Zone Trigger)
  const volumeToLiqRatio = liq > 0 ? vol1h / liq : 0;
  if (ageMin <= 15 && volumeToLiqRatio > 0.4) {
    score += 25; // Rapid Surge Bonus
  } else if (ageMin <= 30 && volumeToLiqRatio > 0.2) {
    score += 15;
  }

  score += Math.min(20, Math.log10(vol24 + 1) * 5);
  score += Math.min(15, Math.log10(liq + 1) * 5);
  score += Math.min(10, buys1h * 0.8);

  if (buyRatio > 0.65) score += 12;
  else if (buyRatio > 0.55) score += 6;

  if (ageMin > 15 && pc1h > 150) score -= 20; 
  if (ageMin > 360) score -= 15;
  if (liq < 5000) score -= 20;

  return Math.max(0, Math.min(100, Math.round(score)));
}

async function sendTelegram(item) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
  
  const cardUrl = `${APP_BASE_URL}/api/telegram/card?name=${encodeURIComponent(item.name)}&score=${item.score}&freshness=${item.isAlphaZone ? "SURGE" : "Early"}&action=${item.isAlphaZone ? "RAPID" : "Research"}&mcap=N/A&vol24h=N/A&captured=${new Date().toISOString().slice(11, 16)}`;
  
  const caption = `ALPHA ZONE | ${item.isAlphaZone ? "⚡ RAPID SURGE" : "🔍 NEW ALPHA"}\n\n` +
                  `${item.name} ($${item.symbol})\n` +
                  `Score: ${item.score}\n` +
                  `Status: ${item.isAlphaZone ? "Extreme Velocity Detected" : "Building Momentum"}\n\n` +
                  `DEX: ${item.dexUrl}`;

  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      photo: cardUrl,
      caption: caption
    })
  });
}

async function scan() {
  try {
    const [latestBoosts, topBoosts, latestProfiles] = await Promise.all([
      fetch("https://api.dexscreener.com/token-boosts/latest/v1").then(r => r.json()).catch(() => []),
      fetch("https://api.dexscreener.com/token-boosts/top/v1").then(r => r.json()).catch(() => []),
      fetch("https://api.dexscreener.com/token-profiles/latest/v1").then(r => r.json()).catch(() => [])
    ]);

    const all = [...latestBoosts, ...topBoosts, ...latestProfiles];
    const grouped = {};
    all.forEach(p => {
      const cid = p.chainId;
      const addr = p.tokenAddress;
      if (!cid || !addr) return;
      grouped[cid] = grouped[cid] || [];
      if (!grouped[cid].includes(addr)) grouped[cid].push(addr);
    });

    const pairs = [];
    for (const [chain, addrs] of Object.entries(grouped)) {
      const res = await fetch(`https://api.dexscreener.com/tokens/v1/${chain}/${addrs.slice(0, 50).join(",")}`).then(r => r.json()).catch(() => []);
      if (Array.isArray(res)) pairs.push(...res);
    }

    await client.connect();
    const db = client.db("alpha-leak");
    const discoveries = db.collection("discoveries");

    for (const pair of pairs) {
      const id = `${pair.chainId}:${pair.pairAddress}`;
      const existing = await discoveries.findOne({ id });
      
      const score = computeScore(pair);
      const vol1h = pair.volume?.h1 || 0;
      const liq = pair.liquidity?.usd || 0;
      const ageMin = pair.pairCreatedAt ? Math.max(1, Math.round((Date.now() - pair.pairCreatedAt) / 60000)) : 9999;
      const isAlphaZone = ageMin <= 25 && (vol1h / liq) > 0.35;

      if (!existing && score >= 70) {
        await discoveries.insertOne({
          id,
          symbol: pair.baseToken.symbol,
          score,
          isAlphaZone,
          discoveryTime: new Date().toISOString().slice(11, 16)
        });

        await sendTelegram({
          name: pair.baseToken.name,
          symbol: pair.baseToken.symbol,
          score,
          isAlphaZone,
          dexUrl: pair.url
        });
      }
    }
  } catch (err) {
    console.error("[SCANNER ERROR]", err);
  } finally {
    await client.close();
  }
}

async function main() {
  console.log("[ALPHA LEAK] Predator Scanner v7 Booting...");
  while (true) {
    await scan();
    await new Promise(r => setTimeout(r, 15000));
  }
}

main();
