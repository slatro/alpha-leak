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

async function checkTokenSecurity(chain, address) {
  try {
    const chainMap = { "ethereum": "1", "base": "8453", "bsc": "56", "arbitrum": "42161", "polygon": "137", "avalanche": "43114", "linea": "59144", "optimism": "10" };
    const goChainId = chainMap[chain];
    let url = chain === "solana" 
      ? `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${address}`
      : (goChainId ? `https://api.gopluslabs.io/api/v1/token_security/${goChainId}?contract_addresses=${address}` : "");

    if (!url) return { safe: true };
    const resp = await fetch(url);
    const data = await resp.json();
    const result = data?.result?.[address.toLowerCase()] || data?.result?.[address] || {};

    if (result.is_honeypot === "1") return { safe: false, reason: "Honeypot" };
    const sellTax = parseFloat(result.sell_tax || "0");
    if (sellTax > 0.15) return { safe: false, reason: "High Tax" };
    
    return { safe: true, result };
  } catch (e) {
    return { safe: true };
  }
}

function computeScore(pair, security = { safe: true }) {
  if (!security.safe) return 0;
  
  const vol1h = safeNum(pair?.volume?.h1);
  const liq = safeNum(pair?.liquidity?.usd);
  const buys1h = safeNum(pair?.txns?.h1?.buys);
  const sells1h = safeNum(pair?.txns?.h1?.sells);
  const ageMin = pair?.pairCreatedAt ? Math.max(1, Math.round((Date.now() - pair.pairCreatedAt) / 60000)) : 9999;
  const buyRatio = (buys1h + sells1h) > 0 ? buys1h / (buys1h + sells1h) : 0.5;

  let score = 35; 

  // Alpha Zone (Red) - $40K+ in first 15 mins
  if (ageMin <= 15 && vol1h >= 40000) {
    score += 25;
  }
  
  // Elite Start (Gold) - $90K+ in first 15 mins
  if (ageMin <= 15 && vol1h >= 90000) {
    score += 20;
  }

  score += Math.min(20, Math.log10(vol1h + 1) * 5);
  score += Math.min(15, Math.log10(liq + 1) * 5);
  
  if (buyRatio > 0.65) score += 12;
  if (liq < 5000) score -= 20;
  if (security.result?.is_open_source === "1") score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

async function sendTelegram(item) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
  
  const label = item.isEliteStart ? "🏆 ELITE START" : (item.isAlphaZone ? "⚡ ALPHA ZONE" : "🔍 NEW ALPHA");
  const action = item.isEliteStart ? "HIGH CONVICTION" : (item.isAlphaZone ? "RAPID ENTRY" : "WATCH");
  
  const cardUrl = `${APP_BASE_URL}/api/telegram/card?name=${encodeURIComponent(item.name)}&score=${item.score}&freshness=${item.isEliteStart ? "ELITE" : "SURGE"}&action=${action}&mcap=N/A&vol24h=N/A&captured=${new Date().toISOString().slice(11, 16)}`;
  
  const caption = `${label} | ${action}\n\n` +
                  `${item.name} ($${item.symbol})\n` +
                  `Score: ${item.score}\n` +
                  `Initial Vol: $${item.vol1h.toLocaleString()}\n\n` +
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
    const [latestBoosts, latestProfiles] = await Promise.all([
      fetch("https://api.dexscreener.com/token-boosts/latest/v1").then(r => r.json()).catch(() => []),
      fetch("https://api.dexscreener.com/token-profiles/latest/v1").then(r => r.json()).catch(() => [])
    ]);

    const all = [...latestBoosts, ...latestProfiles];
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
      if (existing) continue;

      // Security Audit First
      const security = await checkTokenSecurity(pair.chainId, pair.baseToken.address);
      if (!security.safe) {
        console.log(`[REJECTED] ${pair.baseToken.symbol} - ${security.reason}`);
        continue;
      }
      
      const score = computeScore(pair, security);
      const vol1h = pair.volume?.h1 || 0;
      const ageMin = pair.pairCreatedAt ? Math.max(1, Math.round((Date.now() - pair.pairCreatedAt) / 60000)) : 9999;
      
      const isAlphaZone = ageMin <= 15 && vol1h >= 40000;
      const isEliteStart = ageMin <= 15 && vol1h >= 90000;

      if (isAlphaZone || isEliteStart || score >= 75) {
        await discoveries.insertOne({
          id,
          symbol: pair.baseToken.symbol,
          score,
          isAlphaZone,
          isEliteStart,
          discoveryTime: new Date().toISOString().slice(11, 16)
        });

        await sendTelegram({
          name: pair.baseToken.name,
          symbol: pair.baseToken.symbol,
          score,
          isAlphaZone,
          isEliteStart,
          vol1h,
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
  console.log("[ALPHA LEAK] Predator v8.1 ($40K/$90K) Booting...");
  while (true) {
    await scan();
    await new Promise(r => setTimeout(r, 15000));
  }
}

main();
