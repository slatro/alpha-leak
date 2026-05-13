import { modules, opportunities as seededOpportunities, wallets } from "./data.js?v=117";

let opportunities = seededOpportunities.map((item) => ({ ...item }));

const state = {
  activeModule: "tokens",
  selectedFilters: {},
  filterMenuOpen: false,
  sortMenuOpen: false,
  watchlistMode: false,
  selectedId: opportunities[0].id,
  detailId: "",
  accountModal: "",
  watchlist: localStorage.getItem("alphaLeak.watchlist") || "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\n@monad_xyz\n@megaeth_labs",
  savedItems: JSON.parse(localStorage.getItem("alphaLeak.itemWatchlist") || "[]"),
  bias: JSON.parse(localStorage.getItem("alphaLeak.bias") || '{"wallet":18,"freshness":24,"crowd":22}'),
  sortBy: JSON.parse(localStorage.getItem("alphaLeak.sortBy") || '{"tokens":"alpha","nfts":"alpha","airdrops":"alpha","wallets":"alpha","analyzer":"alpha"}'),
  detectedRegistry: JSON.parse(localStorage.getItem("alphaLeak.detectedAt") || "{}"),
  fearGreed: { value: 40, label: "Neutral", updatedAt: 0 },
  searchQuery: "",
  searchResults: [],
  analyzerResults: [],
  searchOpen: false,
  searchLoading: false,
  scoreDeltaMap: {},
  profile: JSON.parse(localStorage.getItem("alphaLeak.profile") || '{"isLoggedIn":false,"walletKey":"","walletName":"","displayName":"Guest Operator","avatar":"signal","walletAddress":""}'),
  balanceUsd: 0,
  balanceEth: 0,
  providers: [],
  activeProviderUuid: "",
  callRegistry: JSON.parse(localStorage.getItem("alphaLeak.callRegistry") || "{}"),
};

let searchDebounce = 0;
let latestSearchRequest = 0;
let copyToastTimer = 0;
const notificationState = {
  audioContext: null,
  audioUnlocked: false,
  primed: false,
  knownTokenIds: new Set(),
  knownHighScoreIds: new Set(),
  scoreSnapshot: {},
};

const tierOneExchanges = [
  "binance",
  "coinbase",
  "bybit",
  "okx",
  "upbit",
  "kraken",
];

const coinMarketCapFearGreedSources = [
  "https://coinmarketcap.com/charts/fear-and-greed-index/",
  "https://r.jina.ai/http://https://coinmarketcap.com/charts/fear-and-greed-index/",
  "https://corsproxy.io/?https://coinmarketcap.com/charts/fear-and-greed-index/",
  "https://r.jina.ai/http://https://coinmarketcap.com/",
];

const actionClass = {
  "Act Now": "act",
  "Research Now": "research",
  "Small Entry Only": "small",
  Watch: "watch",
  Avoid: "avoid",
};

const freshnessClass = {
  "Too Early": "too-early",
  Early: "early",
  "Heating Up": "heating",
  Crowded: "crowded",
  "Too Late": "late",
};

const icons = {
  radar: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="4.9"/><path d="M8.4 8.7h7.2v6.6H8.4z"/><path d="M10 6.2h4M10 17.8h4"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.7"/><circle cx="12" cy="12" r="6.6" opacity="0.22"/><text x="12" y="14.3" text-anchor="middle" font-size="5.3" font-family="Orbitron, sans-serif" font-weight="700" fill="currentColor" stroke="none">NFT</text></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M7 7.2c1.5-2 3.2-3 5-3 1.9 0 3.6 1 5 3"/><path d="M7.4 8.3 5.8 12.8A6.7 6.7 0 0 0 12 18.8a6.7 6.7 0 0 0 6.2-6l-1.6-4.5"/><path d="M12 6.2v7.3"/><path d="M9.8 11.6 12 13.8l2.2-2.2"/></svg>',
  network: '<svg viewBox="0 0 24 24"><circle cx="7" cy="8" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="12" cy="16.5" r="2.2"/><path d="M8.7 9.1 10.8 14M15.5 8.3 13.2 14M9 8h6"/></svg>',
  analyzer: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.8"/><path d="M20 20l-3.4-3.4"/><path d="M11 7.4v7.2M7.4 11h7.2"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20"/></svg>',
  wallet: '<svg viewBox="0 0 24 24"><path d="M4.2 7.5a2.3 2.3 0 0 1 2.3-2.3h10.2a2.3 2.3 0 0 1 2.3 2.3v9a2.3 2.3 0 0 1-2.3 2.3H6.5a2.3 2.3 0 0 1-2.3-2.3Z"/><path d="M4.2 9.2h14.8"/><path d="M15.2 13h4.2v3.4h-4.2z"/><circle cx="16.9" cy="14.7" r="0.7" fill="currentColor" stroke="none"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3.5l2.7 5.5 6.1.9-4.4 4.2 1 6-5.4-2.9-5.4 2.9 1-6-4.4-4.2 6.1-.9L12 3.5z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><path d="M8 5a2 2 0 012-2h6a2 2 0 012 2v11a2 2 0 01-2 2h-6a2 2 0 01-2-2V5z"/><path d="M6 9H4v10a2 2 0 002 2h10v-2H6V9z"/></svg>',
};



// Wallet discovery uses EIP-6963 (announceProvider) when available. This avoids mock data and
// surfaces real wallet names + icons directly from installed providers.

const profileAvatars = [
  { id: "signal", label: "Signal", src: "./assets/avatars/avatar-signal.svg" },
  { id: "nova", label: "Nova", src: "./assets/avatars/avatar-nova.svg" },
  { id: "ghost", label: "Ghost", src: "./assets/avatars/avatar-ghost.svg" },
  { id: "atlas", label: "Atlas", src: "./assets/avatars/avatar-atlas.svg" },
  { id: "iris", label: "Iris", src: "./assets/avatars/avatar-iris.svg" },
  { id: "flux", label: "Flux", src: "./assets/avatars/avatar-flux.svg" },
];

const moduleCopy = {
  tokens: "Token Alpha Radar",
  nfts: "NFT Alpha Radar",
  airdrops: "Airdrop / Testnet Radar",
  wallets: "Smart Wallet Discovery",
  analyzer: "Analyzer",
};

const actionGuidance = {
  "Act Now": "Fresh window, strong wallet confirmation, and crowd is still quiet.",
  "Research Now": "Promising signal, but verify project quality before committing.",
  "Small Entry Only": "Momentum exists, yet the crowd is already warming up.",
  Watch: "Signal is incomplete. Wait for better confirmation.",
  Avoid: "Crowd saturation or late hype has already damaged the edge.",
};

const rankingCopy = {
  tokens: {
    title: "Token Edge Ranking",
    copy: "Live flow is only one layer. Final rank also penalizes weak founders, thin funding, low-tier listings, and crowded public attention.",
    chips: ["Wallet lead", "Trust stack", "Low crowd", "VC / funding"],
  },
  nfts: {
    title: "NFT Edge Ranking",
    copy: "Wallet and floor flow lead, but founder visibility, source quality, and crowd pressure keep weak collections from ranking too high.",
    chips: ["Sweep pressure", "Cheap floor", "Founder linked", "Low saturation"],
  },
  airdrops: {
    title: "Airdrop Edge Ranking",
    copy: "Official source alone is not enough. Scores now weight team quality, surfaced funding, VC quality, trust, crowd and setup freshness together.",
    chips: ["Trusted team", "Backed / funded", "Quiet crowd", "Official source"],
  },
  wallets: {
    title: "Smart Wallet Ranking",
    copy: "Wallets rank by early-entry hit rate, alpha rate, and lower copy risk. Popular wallets lose edge.",
    chips: ["Early hit rate", "Copy-risk drag", "Wallet type", "Recent hit"],
  },
  analyzer: {
    title: "Analyzer",
    copy: "Search by token name or contract, pull the live pair surface, then run the same scoring engine without saving it into the terminal feed.",
    chips: ["Dex search", "Live pair", "No memory save", "Deep analysis"],
  },
};

const moduleThemes = {
  tokens: { accent: "#82d8ff", secondary: "#69f6a2", soft: "rgba(130, 216, 255, 0.12)", glow: "rgba(130, 216, 255, 0.26)" },
  nfts: { accent: "#69f6a2", secondary: "#82d8ff", soft: "rgba(105, 246, 162, 0.12)", glow: "rgba(105, 246, 162, 0.24)" },
  airdrops: { accent: "#f5d06b", secondary: "#ffb86a", soft: "rgba(245, 208, 107, 0.12)", glow: "rgba(245, 208, 107, 0.24)" },
  wallets: { accent: "#ff8ab0", secondary: "#f5d06b", soft: "rgba(255, 138, 176, 0.12)", glow: "rgba(255, 138, 176, 0.24)" },
  analyzer: { accent: "#b497ff", secondary: "#82d8ff", soft: "rgba(180, 151, 255, 0.12)", glow: "rgba(180, 151, 255, 0.24)" },
};

const seededTokenThemeLabels = {
  "token-quai-blofin": "PoW L1",
  "token-chz-fantokens": "Sports Token",
  "token-kub-basel": "L1 Upgrade",
  "token-aethir-enterprise": "AI Compute",
  "token-aleo-community": "Privacy Token",
  "token-xdc-hashkey": "RWA Infra",
};

const seededTokenMarketIds = {
  "token-quai-blofin": "quai-network",
  "token-chz-fantokens": "chiliz",
  "token-kub-basel": "bitkub-coin",
  "token-aethir-enterprise": "aethir",
  "token-aleo-community": "aleo",
  "token-xdc-hashkey": "xdc-network",
};

const sortOptions = {
  tokens: [
    { id: "alpha", label: "Alpha Score" },
    { id: "fresh", label: "Freshest" },
    { id: "wallet", label: "Wallet Signal" },
    { id: "trust", label: "Trust Stack" },
    { id: "volume", label: "Volume" },
    { id: "lowCrowd", label: "Lowest Crowd" },
  ],
  nfts: [
    { id: "alpha", label: "Alpha Score" },
    { id: "fresh", label: "Freshest" },
    { id: "wallet", label: "Wallet Signal" },
    { id: "floor", label: "Lowest Floor" },
    { id: "volume", label: "Highest Volume" },
    { id: "lowCrowd", label: "Lowest Crowd" },
  ],
  airdrops: [
    { id: "alpha", label: "Alpha Score" },
    { id: "fresh", label: "Freshest" },
    { id: "trust", label: "Trust Stack" },
    { id: "wallet", label: "Wallet Signal" },
    { id: "lowCrowd", label: "Lowest Crowd" },
  ],
  wallets: [
    { id: "alpha", label: "Alpha Score" },
    { id: "lowCopy", label: "Lowest Copy Risk" },
    { id: "recent", label: "Recent Hit" },
  ],
  analyzer: [
    { id: "alpha", label: "Alpha Score" },
    { id: "fresh", label: "Freshest" },
    { id: "wallet", label: "Wallet Signal" },
    { id: "volume", label: "24H Volume" },
    { id: "lowCrowd", label: "Lowest Crowd" },
  ],
};

const moduleFilterGroups = {
  tokens: [
    { key: "setup", label: "Setup", options: ["Fresh Launch", "Major Catalyst", "Smart Wallet Lead", "Higher Trust"] },
    { key: "market", label: "Market", options: ["Low Crowd", "Major Venue", "Research Now", "Watch"] },
  ],
  nfts: [
    { key: "flow", label: "Flow", options: ["Fresh Mint", "Sweepers In", "Cheap Entry", "Founder Linked"] },
    { key: "risk", label: "Risk", options: ["Low Crowd", "Research Now", "Watch"] },
  ],
  airdrops: [
    { key: "surface", label: "Surface", options: ["Hot Testnet", "Claim Live", "Apply Now", "Quiet Crowd"] },
    { key: "trust", label: "Trust", options: ["Backed / Funded", "Trusted Team", "Official Source"] },
  ],
  wallets: [
    { key: "walletType", label: "Wallet Type", options: ["Token", "NFT", "Airdrop", "Research"] },
    { key: "quality", label: "Quality", options: ["Low Copy Risk"] },
  ],
  analyzer: [],
};

const credibilityOverrides = {
  "token-quai-blofin": { projectTrust: 55, founderTrust: 40, fundingStrength: 34, vcQuality: 28, security: 56, catalystQuality: 24, listingTier: 18, founderNote: "Minor venue catalyst and thin public team/investor edge." },
  "token-chz-fantokens": { projectTrust: 84, founderTrust: 74, fundingStrength: 68, vcQuality: 64, security: 72, catalystQuality: 48, listingTier: 58, founderNote: "Established brand, but this rollout is already visible." },
  "token-kub-basel": { projectTrust: 66, founderTrust: 58, fundingStrength: 40, vcQuality: 30, security: 64, catalystQuality: 46, listingTier: 34, founderNote: "Regional chain with a real catalyst, not a global tier-one listing." },
  "token-aethir-enterprise": { projectTrust: 78, founderTrust: 76, fundingStrength: 86, vcQuality: 84, security: 44, catalystQuality: 58, listingTier: 62, founderNote: "Strong investors and revenue story, but bridge/security overhang remains." },
  "token-aleo-community": { projectTrust: 72, founderTrust: 69, fundingStrength: 88, vcQuality: 86, security: 70, catalystQuality: 26, listingTier: 50, founderNote: "High-quality ecosystem history, but current catalyst is soft." },
  "token-xdc-hashkey": { projectTrust: 74, founderTrust: 64, fundingStrength: 58, vcQuality: 68, security: 70, catalystQuality: 36, listingTier: 56, founderNote: "Institutional cooperation is real, but not enough by itself." },
  "airdrop-netrun-testnet": { projectTrust: 34, founderTrust: 22, fundingStrength: 6, vcQuality: 0, security: 38, catalystQuality: 58, listingTier: 0, founderNote: "Official application surface is real, but funding and team quality are still lightly surfaced." },
  "airdrop-rocketfi-testnet": { projectTrust: 52, founderTrust: 42, fundingStrength: 14, vcQuality: 12, security: 58, catalystQuality: 54, listingTier: 0, founderNote: "Real testnet app exists, but investor quality is not clearly surfaced from strong primary sources." },
  "airdrop-base-azul": { projectTrust: 92, founderTrust: 90, fundingStrength: 92, vcQuality: 90, security: 88, catalystQuality: 44, listingTier: 0, founderNote: "Very credible source, but not a direct farm." },
  "airdrop-lora-season-one": { projectTrust: 46, founderTrust: 34, fundingStrength: 22, vcQuality: 20, security: 48, catalystQuality: 48, listingTier: 0, founderNote: "Real product path, but public investor/VC quality is not clearly surfaced here." },
  "airdrop-genlayer": { projectTrust: 86, founderTrust: 78, fundingStrength: 78, vcQuality: 76, security: 72, catalystQuality: 64, listingTier: 0, founderNote: "GenLayer has formal incentivized tracks, surfaced investors, and a clearer reward framework than generic task farms." },
  "airdrop-seismic-testnet": { projectTrust: 92, founderTrust: 84, fundingStrength: 90, vcQuality: 92, security: 84, catalystQuality: 68, listingTier: 0, founderNote: "Seismic combines strong funding quality with an official faucet-role gate and live public testnet primitives." },
  "airdrop-open-gradient": { projectTrust: 90, founderTrust: 82, fundingStrength: 94, vcQuality: 94, security: 78, catalystQuality: 58, listingTier: 0, founderNote: "OpenGradient has stronger surfaced backers and a real claim window, but it is no longer an early farm." },
};

function qs(id) {
  return document.getElementById(id);
}

function isGuestMode() {
  return !state.profile?.isLoggedIn;
}

function saveProfile() {
  localStorage.setItem("alphaLeak.profile", JSON.stringify(state.profile));
}

function ensureCopyToast() {
  let toast = document.getElementById("copyToast");
  if (toast) return toast;
  toast = document.createElement("div");
  toast.id = "copyToast";
  toast.className = "copy-toast";
  toast.innerHTML = `
    <div class="toast-content">
      <span id="toastLabel"></span>
      <button class="toast-close" type="button" aria-label="Close" onclick="this.closest('.copy-toast').classList.remove('is-visible')">${icons.x}</button>
    </div>
    <div class="toast-progress"><div id="toastProgressBar"></div></div>
  `;
  document.body.appendChild(toast);
  return toast;
}

function showCopyToast(htmlContent = "Copied", duration = 1100) {
  const toast = ensureCopyToast();
  const labelEl = document.getElementById("toastLabel");
  const progressEl = document.getElementById("toastProgressBar");
  if (labelEl) labelEl.innerHTML = htmlContent;
  
  toast.classList.add("is-visible");
  if (progressEl) {
    progressEl.style.transition = "none";
    progressEl.style.width = "100%";
    setTimeout(() => {
      progressEl.style.transition = `width ${duration}ms linear`;
      progressEl.style.width = "0%";
    }, 10);
  }

  clearTimeout(copyToastTimer);
  copyToastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, duration);
}

function saveDetectedRegistry() {
  localStorage.setItem("alphaLeak.detectedAt", JSON.stringify(state.detectedRegistry));
}

function saveCallRegistry() {
  localStorage.setItem("alphaLeak.callRegistry", JSON.stringify(state.callRegistry));
}

function rememberDiscoveries(items) {
  let changed = false;
  items.forEach((item) => {
    if (!state.detectedRegistry[item.id]) {
      state.detectedRegistry[item.id] = Date.now();
      changed = true;
    }
  });
  if (changed) saveDetectedRegistry();
}

function tokenRegistryEntry(item) {
  if (!item || (item.module !== "tokens" && item.module !== "analyzer")) return null;
  if (!item.raw) return null;
  const price = Number(item.raw.priceUsd || item.marketRaw?.price || 0);
  const id = item.id;
  if (!id) return null;
  return { id, price };
}

function touchCallRegistry(items) {
  let changed = false;
  const now = Date.now();
  items.forEach((item) => {
    const entry = tokenRegistryEntry(item);
    if (!entry) return;
    const ts = detectedAt(item) || now;
    const prev = state.callRegistry[entry.id];
    if (!prev) {
      state.callRegistry[entry.id] = {
        firstCallAt: ts,
        firstPrice: entry.price || 0,
        lastCallAt: ts,
        lastCallPrice: entry.price || 0,
        lastSeenAt: now,
        lastPrice: entry.price || 0,
        peakPrice: entry.price || 0,
        callCount: 1,
        retiredUntil: 0,
      };
      changed = true;
      return;
    }
    const gapMinutes = prev.lastSeenAt ? Math.round((now - prev.lastSeenAt) / 60000) : 0;
    const isReturn = gapMinutes >= 30;
    const next = { ...prev };
    next.lastSeenAt = now;
    if (entry.price) {
      next.lastPrice = entry.price;
      next.peakPrice = Math.max(Number(next.peakPrice || 0), entry.price);
      if (!next.firstPrice) next.firstPrice = entry.price;
    }
    if (!next.firstCallAt) next.firstCallAt = ts;
    if (isReturn) {
      next.callCount = Math.min(9, Number(next.callCount || 1) + 1);
      next.lastCallAt = ts;
      if (entry.price) next.lastCallPrice = entry.price;
    }
    if (!next.lastCallAt) next.lastCallAt = next.firstCallAt || ts;
    if (!next.lastCallPrice && entry.price) next.lastCallPrice = entry.price;
    state.callRegistry[entry.id] = next;
    changed = true;
  });

  // Retirement pass: once a call has largely played out, keep it from re-surfacing immediately.
  items.forEach((item) => {
    if (item.module !== "tokens") return;
    const reg = state.callRegistry[item.id];
    if (!reg) return;
    if (reg.retiredUntil && reg.retiredUntil > now) return;
    if (!shouldRetireToken(item)) return;
    state.callRegistry[item.id] = { ...reg, retiredUntil: now + 6 * 60 * 60000 };
    changed = true;
  });

  if (changed) saveCallRegistry();
}

function callInfo(item) {
  const reg = state.callRegistry[item.id];
  if (!reg) return null;
  const entryPrice = Number(reg.lastCallPrice || reg.firstPrice || 0);
  const nowPrice = Number(tokenRegistryEntry(item)?.price || reg.lastPrice || 0);
  const callCount = Number(reg.callCount || 1);
  const deltaPct = entryPrice && nowPrice ? ((nowPrice - entryPrice) / entryPrice) * 100 : 0;
  return {
    callCount,
    entryAt: Number(reg.lastCallAt || reg.firstCallAt || 0),
    entryPrice,
    nowPrice,
    deltaPct,
  };
}

function fmtPrice(value) {
  const n = Number(value || 0);
  if (!n) return "N/A";
  if (n >= 1) return `$${n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}`;
  if (n >= 0.01) return `$${n.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}`;
  return `$${n.toPrecision(4)}`;
}

function shouldRetireToken(item) {
  const info = callInfo(item);
  if (!info || !info.entryPrice || !info.nowPrice) return false;
  const minutesSinceEntry = info.entryAt ? (Date.now() - info.entryAt) / 60000 : 0;
  const win = info.deltaPct;
  if (minutesSinceEntry < 18) return false;
  return win >= 60 || win >= 90;
}

function carryForwardToken(item) {
  const info = callInfo(item);
  if (!info) return false;
  const minutesSinceSeen = (Date.now() - (state.callRegistry[item.id]?.lastSeenAt || 0)) / 60000;
  const minutesSinceEntry = info.entryAt ? (Date.now() - info.entryAt) / 60000 : 0;
  if (minutesSinceEntry > 120) return false;
  if (minutesSinceSeen <= 8) return true;
  if (minutesSinceEntry <= 90) return true;
  if (info.deltaPct >= 55) return false;
  return minutesSinceEntry <= 120;
}

function formatRelative(minutes) {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

function formatClock(timestamp) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(timestamp);
}

function formatExactTime(timestamp) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(timestamp);
}

function detectedAt(item) {
  return state.detectedRegistry[item.id] || 0;
}

function discoveryLabel(item) {
  const ts = detectedAt(item);
  if (!ts) return item.firstSeen;
  const minutes = Math.max(1, Math.round((Date.now() - ts) / 60000));
  return `${formatClock(ts)} · ${formatRelative(minutes)}`;
}

function detailSeenLabel(item) {
  const ts = detectedAt(item);
  if (!ts) return item.firstSeen;
  return `Captured ${formatExactTime(ts)}`;
}

function callLineMarkup(item) {
  if (!["tokens", "analyzer"].includes(item.module)) return "";
  const info = callInfo(item);
  if (!info) return "";
  const callTag = info.callCount >= 2 ? `Second Call x${info.callCount}` : "First Call";
  const entryTime = info.entryAt ? formatClock(info.entryAt) : "";
  const entry = info.entryPrice ? fmtPrice(info.entryPrice) : "N/A";
  const now = info.nowPrice ? fmtPrice(info.nowPrice) : "N/A";
  const delta = info.entryPrice && info.nowPrice ? `${info.deltaPct >= 0 ? "+" : ""}${info.deltaPct.toFixed(1)}%` : "";
  return `
    <p class="call-line">
      <span class="call-tag">${callTag}</span>
      <span class="call-metrics">${entryTime ? `${entryTime} · ` : ""}Entry <strong>${entry}</strong> · Now <strong>${now}</strong>${delta ? ` <em>${delta}</em>` : ""}</span>
    </p>
  `;
}

function themeVars(module) {
  const theme = moduleThemes[module] || moduleThemes.tokens;
  return `--module-accent:${theme.accent};--module-secondary:${theme.secondary};--module-soft:${theme.soft};--module-glow:${theme.glow};`;
}

function classifyFearGreed(value) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  if (safe < 20) return "Extreme Fear";
  if (safe < 40) return "Fear";
  if (safe < 60) return "Neutral";
  if (safe < 80) return "Greed";
  return "Extreme Greed";
}

function parseCoinMarketCapFearGreed(payload = "") {
  const raw = String(payload || "");
  if (!raw.trim()) return null;

  const decoded = raw
    .replaceAll("\\u0026", "&")
    .replaceAll("&amp;", "&");

  let htmlText = "";
  try {
    htmlText = new DOMParser().parseFromString(decoded, "text/html").body?.textContent || "";
  } catch {
    htmlText = "";
  }

  const candidates = [decoded, htmlText].filter(Boolean);

  for (const candidate of candidates) {
    const compact = candidate.replace(/\s+/g, " ").trim();
    const currentIndexMatch = compact.match(/"currentIndex"\s*:\s*\{\s*"score"\s*:\s*(\d{1,3})[^}]*?"name"\s*:\s*"([^"]+)"/i);
    if (currentIndexMatch) {
      const value = Math.max(0, Math.min(100, Number(currentIndexMatch[1]) || 0));
      const label = currentIndexMatch[2] || classifyFearGreed(value);
      const updated = compact.match(/"update(?:Time|_time)"\s*:\s*"([^"]+)"/i)?.[1];
      return {
        value,
        label,
        updatedAt: updated ? Date.parse(updated) || Date.now() : Date.now(),
      };
    }

    const footerMatch = compact.match(/Fear\s*&\s*Greed[^0-9]{0,64}(\d{1,3})\s*\/\s*100/i);
    if (footerMatch) {
      const value = Math.max(0, Math.min(100, Number(footerMatch[1]) || 0));
      return {
        value,
        label: classifyFearGreed(value),
        updatedAt: Date.now(),
      };
    }
  }

  return null;
}

function fearPointerPosition(value) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  const angle = Math.PI - ((safe / 100) * Math.PI);
  const cx = 160;
  const cy = 140;
  const radius = 97;
  return {
    x: +(cx + (Math.cos(angle) * radius)).toFixed(2),
    y: +(cy - (Math.sin(angle) * radius)).toFixed(2),
    angleDeg: +((angle * 180) / Math.PI).toFixed(2),
  };
}

function renderFearGreedWidget() {
  const valueNode = qs("fearGreedValue");
  const labelNode = qs("fearGreedLabel");
  const pointer = qs("fearPointer");
  const shadow = qs("fearPointerShadow");
  if (!valueNode || !labelNode || !pointer || !shadow) return;
  const safe = Math.max(0, Math.min(100, Number(state.fearGreed.value) || 0));
  const label = state.fearGreed.label || classifyFearGreed(safe);
  const { x, y, angleDeg } = fearPointerPosition(safe);
  valueNode.textContent = `${safe}`;
  labelNode.textContent = label;
  const rotation = +(angleDeg + 90).toFixed(2);
  pointer.setAttribute("transform", `translate(${x} ${y}) rotate(${rotation})`);
  shadow.setAttribute("transform", `translate(${x} ${y + 0.7}) rotate(${rotation})`);
}

async function refreshFearGreed() {
  for (const source of coinMarketCapFearGreedSources) {
    try {
      const response = await fetch(source, {
        cache: "no-store",
        headers: { Accept: "text/plain, text/html, application/json" },
      });
      if (!response.ok) continue;
      const parsed = parseCoinMarketCapFearGreed(await response.text());
      if (!parsed) continue;
      state.fearGreed = {
        value: parsed.value,
        label: parsed.label || classifyFearGreed(parsed.value),
        updatedAt: parsed.updatedAt || Date.now(),
      };
      return true;
    } catch {
      continue;
    }
  }
  return false;
}

function currentSortKey(module = state.activeModule) {
  return state.sortBy[module] || sortOptions[module]?.[0]?.id || "alpha";
}

function setSortKey(module, key) {
  state.sortBy[module] = key;
  localStorage.setItem("alphaLeak.sortBy", JSON.stringify(state.sortBy));
}

function hostFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function dedupeUrlList(values = []) {
  const seen = new Set();
  return values.filter((value) => {
    const safe = safeUrl(value);
    if (!safe || seen.has(safe)) return false;
    seen.add(safe);
    return true;
  });
}

function hostLogoSources(host = "") {
  const clean = String(host || "").replace(/^www\./, "").trim().toLowerCase();
  if (!clean || /^(opensea\.io|pro\.opensea\.io|etherscan\.io|basescan\.org|solscan\.io|dexscreener\.com|x\.com|twitter\.com)$/i.test(clean)) {
    return [];
  }
  return [
    `https://logo.clearbit.com/${clean}`,
    `https://www.google.com/s2/favicons?sz=128&domain_url=https://${clean}`,
  ];
}

function textToHex(text = "") {
  return Array.from(String(text || ""))
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
}

function avatarAccent(item) {
  const key = displayTitle(item).toUpperCase();
  const known = {
    ALEO: ["#f5f8ff", "#69788e"],
    CHZ: ["#ff5e79", "#602133"],
    ATH: ["#d5ff54", "#2b3611"],
    WLD: ["#9ca8ff", "#2b2f57"],
    KUB: ["#64e7ff", "#113a48"],
    XDC: ["#4a82ff", "#162958"],
    SOL: ["#8a5dff", "#19112f"],
    SEISMIC: ["#d9a6cf", "#55364f"],
    GENLAYER: ["#ffc96a", "#4f3a17"],
    XENEA: ["#7df4ff", "#15343d"],
    QUIP: ["#98f2ff", "#173945"],
    RISEX: ["#f6bc63", "#4d3314"],
  };
  if (known[key]) return known[key];
  let hash = 0;
  for (const char of key) hash = ((hash << 5) - hash) + char.charCodeAt(0);
  const hue = Math.abs(hash) % 360;
  return [`hsl(${hue} 88% 72%)`, `hsl(${hue} 48% 18%)`];
}

function avatarSurfaceVars(item) {
  const [soft, deep] = avatarAccent(item);
  return `--avatar-soft:${soft};--avatar-deep:${deep};--avatar-fit:cover;--avatar-pad:0px;`;
}

function generatedAvatarDataUri(item) {
  const title = displayTitle(item).slice(0, 4).toUpperCase();
  const [soft, deep] = avatarAccent(item);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
      <defs>
        <linearGradient id="g" x1="9" y1="8" x2="62" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${soft}"/>
          <stop offset="1" stop-color="${deep}"/>
        </linearGradient>
      </defs>
      <rect width="72" height="72" rx="14" fill="url(#g)"/>
      <rect x="6" y="6" width="60" height="60" rx="11" fill="rgba(5,10,16,0.22)"/>
      <text x="36" y="44" fill="#f8fbff" font-family="Inter,Arial,sans-serif" font-size="22" font-weight="700" text-anchor="middle">${title}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function scoreColor(score) {
  const safe = Math.max(0, Math.min(100, score));
  const bucket = Math.floor(Math.min(99, safe) / 10) * 10;
  const hue = Math.round((bucket / 100) * 120);
  return `hsl(${hue} 88% 58%)`;
}

function scoreBadgeVars(score) {
  return `--score-color:${scoreColor(score)};`;
}

function scoreDeltaMarkup(id) {
  const delta = state.scoreDeltaMap ? state.scoreDeltaMap[id] : null;
  if (!delta) return "";
  const svg = delta > 0
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="score-delta-svg"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" class="score-delta-svg"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>`;
  const sign = delta > 0 ? "+" : "";
  return `
    <div class="score-delta ${delta > 0 ? "up" : "down"}" aria-label="${delta > 0 ? "Score moved up" : "Score moved down"}">
      <span class="delta-val">${sign}${delta}</span>
      ${svg}
    </div>
  `;
}

const coinMarketCalCoinPages = {
  QUAI: "https://coinmarketcal.com/en/coin/quai-network",
  CHZ: "https://coinmarketcal.com/en/coin/chiliz",
  KUB: "https://coinmarketcal.com/en/coin/bitkub-coin",
  ATH: "https://coinmarketcal.com/en/coin/aethir",
  ALEO: "https://coinmarketcal.com/en/coin/aleo",
  XDC: "https://coinmarketcal.com/en/coin/xinfin-network",
};

function coinMarketCalCoinUrl(item) {
  return coinMarketCalCoinPages[displayTitle(item)] || "";
}

function dexscreenerPairRef(url = "") {
  const safe = safeUrl(url);
  const match = safe.match(/dexscreener\.com\/([^/?#]+)\/([^/?#]+)/i);
  if (!match) return null;
  return {
    chainId: String(match[1] || "").toLowerCase(),
    pairAddress: String(match[2] || "").trim(),
  };
}

function dexscreenerLinkForItem(item) {
  return (item.links || []).find((link) => /^DEX\b/i.test(link.label) && /dexscreener\.com/i.test(link.url));
}

function normalizeDexPairPayload(payload) {
  if (!payload) return null;
  if (payload.pair) return payload.pair;
  if (Array.isArray(payload.pairs) && payload.pairs.length) return payload.pairs[0];
  return null;
}

function mergeDexPairMetricsIntoItem(item, pair) {
  if (!pair) return item;
  const raw = item.raw || {};
  return {
    ...item,
    imageUrl: pair.info?.imageUrl || pair.info?.openGraph || item.imageUrl,
    raw: {
      ...raw,
      chain: pair.chainId || raw.chain || "",
      dex: pair.dexId || raw.dex || "",
      tokenAddress: pair.baseToken?.address || raw.tokenAddress || "",
      pairAddress: pair.pairAddress || raw.pairAddress || "",
      priceUsd: Number(pair.priceUsd || raw.priceUsd || 0),
      marketCap: Number(pair.marketCap || raw.marketCap || 0),
      fdv: Number(pair.fdv || raw.fdv || 0),
      buys1h: Number(pair.txns?.h1?.buys || raw.buys1h || 0),
      sells1h: Number(pair.txns?.h1?.sells || raw.sells1h || 0),
      buys24h: Number(pair.txns?.h24?.buys || raw.buys24h || 0),
      sells24h: Number(pair.txns?.h24?.sells || raw.sells24h || 0),
      volume24h: Number(pair.volume?.h24 || raw.volume24h || 0),
      liquidity: Number(pair.liquidity?.usd || raw.liquidity || 0),
      priceChange1h: Number(pair.priceChange?.h1 || raw.priceChange1h || 0),
      priceChange24h: Number(pair.priceChange?.h24 || raw.priceChange24h || 0),
      volLiq: Number(pair.liquidity?.usd || raw.liquidity || 0)
        ? Number(pair.volume?.h24 || raw.volume24h || 0) / Number(pair.liquidity?.usd || raw.liquidity || 1)
        : Number(raw.volLiq || 0),
    },
  };
}

function dedupeLinks(links) {
  const seen = new Set();
  return links.filter((link) => {
    const key = `${link?.label || ""}::${link?.url || ""}`;
    if (!link?.url || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function itemLinksWithEnhancements(item) {
  const coinPage = coinMarketCalCoinUrl(item);
  const links = [...(item.links || [])].map((link) => {
    if (/coinmarketcap\.com\/events/i.test(link.url) && coinPage) return { label: "CoinMarketCal", url: coinPage };
    return link;
  });
  if (item.module === "tokens" && coinPage) links.unshift({ label: "CoinMarketCal", url: coinPage });
  return dedupeLinks(links);
}

function resolvedImageSources(item) {
  const links = itemLinksWithEnhancements(item);
  const seedImage = safeUrl(item.imageUrl);
  const seedIsWeakIcon = /google\.com\/s2\/favicons|favicon/i.test(seedImage);
  const preferredHosts = links
    .filter((link) => /website|creator|foundation|portal|beta|app|official|docs|quickstart|faucet|testnet/i.test(link.label) && !/opensea|explorer|etherscan|solscan|basescan|dex/i.test(link.label))
    .map((link) => hostFromUrl(link.url));
  const secondaryHosts = links
    .filter((link) => !/^X\b|^X @/i.test(link.label))
    .map((link) => hostFromUrl(link.url));
  const x = links.find((link) => /^X\b|^X @/i.test(link.label));
  const handle = x ? xHandleFromUrl(x.url) : "";
  return dedupeUrlList([
    seedIsWeakIcon ? "" : seedImage,
    ...preferredHosts.flatMap(hostLogoSources),
    ...secondaryHosts.flatMap(hostLogoSources),
    seedIsWeakIcon ? seedImage : "",
    handle ? `https://unavatar.io/x/${handle}` : "",
    generatedAvatarDataUri(item),
  ]);
}

function resolvedImageUrl(item) {
  return resolvedImageSources(item)[0] || "";
}

function applyActiveTheme() {
  const shell = document.querySelector(".app-shell");
  const theme = moduleThemes[state.activeModule] || moduleThemes.tokens;
  if (!shell) return;
  shell.style.setProperty("--active-accent", theme.accent);
  shell.style.setProperty("--active-accent-2", theme.secondary);
  shell.style.setProperty("--active-soft", theme.soft);
  shell.style.setProperty("--active-glow", theme.glow);
}

function catalystSurfaceText(item) {
  return [
    item.segment,
    item.category,
    item.liquidity,
    item.volumeSpike,
    item.thesis,
    item.researchNote,
    ...(item.catalysts || []).flatMap((entry) => [entry.title, entry.window, entry.impact, entry.label, entry.url]),
    ...(item.links || []).flatMap((entry) => [entry.label, entry.url]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isListingDrivenToken(item) {
  if (!["tokens", "analyzer"].includes(item.module)) return false;
  const text = catalystSurfaceText(item);
  return /\blisting\b|\bspot live\b|\bspot trading\b|\bnew cex\b|\bexchange access\b/.test(text);
}

function hasTierOneListingSignal(item) {
  if (!["tokens", "analyzer"].includes(item.module)) return false;
  const text = catalystSurfaceText(item);
  return tierOneExchanges.some((exchange) => text.includes(exchange));
}

function tokenRadarEligible(item) {
  if (!["tokens", "analyzer"].includes(item.module)) return true;
  if (item.raw) return true;
  if (!isListingDrivenToken(item)) return true;
  return hasTierOneListingSignal(item);
}

function isVisibleOpportunity(item) {
  return !["tokens", "analyzer"].includes(item.module) || tokenRadarEligible(item);
}

function credibilityProfile(item) {
  const baseByModule = {
    tokens: { projectTrust: 34, founderTrust: 20, fundingStrength: 12, vcQuality: 10, security: 32, catalystQuality: 38, listingTier: 8 },
    nfts: { projectTrust: 42, founderTrust: 34, fundingStrength: 18, vcQuality: 10, security: 38, catalystQuality: 28, listingTier: 0 },
    airdrops: { projectTrust: 36, founderTrust: 24, fundingStrength: 12, vcQuality: 10, security: 34, catalystQuality: 40, listingTier: 0 },
    narratives: { projectTrust: 52, founderTrust: 40, fundingStrength: 38, vcQuality: 34, security: 56, catalystQuality: 36, listingTier: 0 },
  };
  const override = credibilityOverrides[item.id] || {};
  const profile = { ...(baseByModule[item.module] || baseByModule.tokens), ...override };
  if (["tokens", "analyzer"].includes(item.module) && isListingDrivenToken(item) && !hasTierOneListingSignal(item)) {
    profile.catalystQuality = Math.min(profile.catalystQuality, 16);
    profile.listingTier = 0;
    profile.projectTrust = Math.min(profile.projectTrust, 46);
  }
  if (!Object.keys(override).length && item.raw) {
    const hasX = item.links?.some((link) => /^X\b|^X @/i.test(link.label));
    const hasSite = item.links?.some((link) => /website/i.test(link.label));
    profile.projectTrust += (hasX ? 10 : 0) + (hasSite ? 8 : 0) + Math.min(16, Math.round((item.raw.liquidity || 0) / 15000));
    profile.founderTrust += hasX ? 8 : 0;
    profile.security += Math.min(20, Math.round((item.raw.liquidity || 0) / 18000));
    profile.catalystQuality += Math.min(12, Math.round((item.raw.buys24h || 0) / 850));
  }
  if (!Object.keys(override).length && item.nftRaw) {
    const hasX = item.links?.some((link) => /^X\b|^X @/i.test(link.label));
    profile.projectTrust += hasX ? 8 : 0;
    profile.founderTrust += hasX ? 10 : 0;
    profile.security += Math.min(12, Math.round((item.nftRaw.ownerCount || 0) / 220));
  }
  return profile;
}

function trustComposite(item) {
  const profile = credibilityProfile(item);
  return Math.round((profile.projectTrust * 0.34) + (profile.founderTrust * 0.22) + (profile.fundingStrength * 0.18) + (profile.vcQuality * 0.16) + (profile.security * 0.1));
}

function freshnessValue(freshness) {
  return {
    "Too Early": 92,
    Early: 82,
    "Heating Up": 58,
    Crowded: 26,
    "Too Late": 8,
  }[freshness] ?? 40;
}

function qualityBreakdown(item) {
  const profile = credibilityProfile(item);
  const signalQuality = item.score;
  const xQuality = Math.max(0, Math.min(100, Math.round((item.xSignal * 0.52) + (item.xIntel?.quality || 44) * 0.48 - (item.xIntel?.botRate || 0) * 0.32)));
  const trust = trustComposite(item);
  const components = {
    signalQuality,
    freshness: freshnessValue(item.freshness),
    walletConviction: item.walletSignal,
    xQuality,
    crowdInversion: 100 - item.crowd,
    riskControl: 100 - item.risk,
    trust,
    founderTrust: profile.founderTrust,
    fundingStrength: profile.fundingStrength,
    vcQuality: profile.vcQuality,
    catalystQuality: profile.catalystQuality,
    listingTier: profile.listingTier,
  };
  const weighted = (
    components.signalQuality * 0.23
    + components.freshness * 0.12
    + components.walletConviction * 0.14
    + components.xQuality * 0.08
    + components.crowdInversion * 0.09
    + components.riskControl * 0.06
    + components.trust * 0.12
    + components.founderTrust * 0.05
    + components.fundingStrength * 0.04
    + components.vcQuality * 0.03
    + components.catalystQuality * 0.03
    + components.listingTier * 0.01
  );
  return { ...components, composite: Math.max(0, Math.min(100, Math.round(weighted))) };
}

function hasOfficialSurface(item) {
  return (item.links || []).some((link) => /website|creator|foundation|portal|official|docs|quickstart|faucet|apply|dashboard|opensea|collection|testnet|blog|X @/i.test(link.label));
}

function moduleScoreFloor(module) {
  return {
    tokens: 74,
    nfts: 72,
    airdrops: 76,
    narratives: 70,
    wallets: 0,
  }[module] ?? 70;
}

function moduleResultCap(module) {
  return {
    tokens: 12,
    nfts: 12,
    airdrops: 12,
    narratives: 10,
    wallets: 24,
  }[module] ?? 12;
}

function signalSynergyBonus(item, breakdown = qualityBreakdown(item)) {
  const walletEdge = item.walletSignal - item.crowd;
  const profile = credibilityProfile(item);
  let bonus = 0;

  if (["Too Early", "Early"].includes(item.freshness)) bonus += 5;
  else if (item.freshness === "Heating Up") bonus += 1;

  if (walletEdge >= 22) bonus += 10;
  else if (walletEdge >= 14) bonus += 6;
  else if (walletEdge >= 8) bonus += 3;

  if (breakdown.trust >= 66) bonus += 6;
  else if (breakdown.trust >= 58) bonus += 3;

  if (breakdown.xQuality >= 62 && (item.xIntel?.botRate || 0) <= 16) bonus += 4;
  if (hasOfficialSurface(item)) bonus += 3;

  if (item.module === "tokens" || item.module === "analyzer") {
    const liq = item.raw?.liquidity || 0;
    const vol = item.raw?.volume24h || item.marketRaw?.volume24h || 0;
    if (liq >= 12000 && vol >= 45000) bonus += 7;
    else if (liq >= 5000 && vol >= 12000) bonus += 3;
    if (profile.listingTier >= 70 && breakdown.catalystQuality >= 60) bonus += 5;
  } else if (item.module === "nfts") {
    const sourceQuality = item.raw?.sourceQuality || item.sourceQuality || 0;
    if ((item.nftRaw?.eventCount || 0) >= 3) bonus += 5;
    if ((item.nftRaw?.dayVolume || 0) >= 1.2) bonus += 4;
    if (sourceQuality >= 8) bonus += 5;
    else if (sourceQuality >= 6) bonus += 2;
  } else if (item.module === "airdrops") {
    if ((item.tasks?.length || 0) >= 3) bonus += 5;
    if ((item.roleIntel?.length || 0) >= 2) bonus += 5;
    if (breakdown.fundingStrength >= 70 || breakdown.vcQuality >= 70) bonus += 6;
  } else if (item.module === "narratives") {
    if (breakdown.trust >= 64 && item.crowd < 45) bonus += 6;
    if (/\bcluster|basket|rotation|forming|early/i.test(`${item.thesis} ${item.researchNote}`)) bonus += 3;
  }

  return bonus;
}

function convictionPenalty(item, breakdown = qualityBreakdown(item)) {
  const walletEdge = item.walletSignal - item.crowd;
  let penalty = 0;

  if (!hasOfficialSurface(item)) penalty += 7;
  if (item.crowd >= 66) penalty += 12;
  else if (item.crowd >= 56) penalty += 6;
  if (item.risk >= 84) penalty += 12;
  else if (item.risk >= 72) penalty += 6;
  if (walletEdge < 0) penalty += 8;
  else if (walletEdge < 6) penalty += 4;
  if (breakdown.xQuality < 32) penalty += 5;

  if (item.module === "tokens" || item.module === "analyzer") {
    const liq = item.raw?.liquidity || 0;
    const vol = item.raw?.volume24h || item.marketRaw?.volume24h || 0;
    if (item.raw && liq < 3000) penalty += 14;
    else if (item.raw && liq < 7000) penalty += 7;
    if (item.raw && vol < 2500) penalty += 10;
    if (isListingDrivenToken(item) && !hasTierOneListingSignal(item)) penalty += 25;
  } else if (item.module === "nfts") {
    const dayVolume = item.nftRaw?.dayVolume || 0;
    const sourceQuality = item.raw?.sourceQuality || item.sourceQuality || 0;
    if (dayVolume < 0.12) penalty += 10;
    if ((item.nftRaw?.eventCount || 0) === 0 && dayVolume < 0.5) penalty += 7;
    if (sourceQuality < 6) penalty += 8;
  } else if (item.module === "airdrops") {
    if ((item.tasks?.length || 0) < 2) penalty += 14;
    if ((item.roleIntel?.length || 0) === 0) penalty += 6;
    if (breakdown.fundingStrength < 35 && breakdown.vcQuality < 30) penalty += 10;
  } else if (item.module === "narratives") {
    if (item.crowd >= 60) penalty += 10;
    if (breakdown.trust < 54) penalty += 8;
  }

  return penalty;
}

function harshAlphaScore(item) {
  const breakdown = qualityBreakdown(item);
  const base = breakdown.composite;
  const freshnessBoost = ["Too Early", "Early"].includes(item.freshness) ? state.bias.freshness * 0.1 : 0;
  const walletBoost = item.walletSignal > 68 ? state.bias.wallet * 0.08 : 0;
  const crowdPenalty = item.crowd > 58 ? state.bias.crowd * 0.14 : 0;
  const conviction = signalSynergyBonus(item, breakdown);
  const penalty = convictionPenalty(item, breakdown);
  return Math.max(0, Math.min(100, Math.round(base + freshnessBoost + walletBoost + conviction - crowdPenalty - penalty)));
}

function harshAlphaEligible(item) {
  if (item.module === "wallets") return true;
  const breakdown = qualityBreakdown(item);
  const score = harshAlphaScore(item);
  const walletEdge = item.walletSignal - item.crowd;

  if (score < moduleScoreFloor(item.module)) return false;
  if (["Crowded", "Too Late"].includes(item.freshness)) return false;
  if (item.risk >= 86) return false;

  if (item.module === "tokens" || item.module === "analyzer") {
    const liq = item.raw?.liquidity || 0;
    const vol = item.raw?.volume24h || item.marketRaw?.volume24h || 0;
    return (
      (item.raw ? liq >= 1000 && vol >= 1000 : true)
      && walletEdge >= 0
      && item.crowd <= 75
      && (breakdown.trust >= 30 || breakdown.catalystQuality >= 40 || hasOfficialSurface(item))
    );
  }

  if (item.module === "nfts") {
    const dayVolume = item.nftRaw?.dayVolume || 0;
    const floorEvents = item.nftRaw?.eventCount || 0;
    const sourceQuality = item.nftRaw?.sourceQuality || item.sourceQuality || 0;
    const hasMarketLink = (item.links || []).some((link) => /^OpenSea\b/i.test(link.label));
    return (
      hasMarketLink
      && item.crowd <= 58
      && (walletEdge >= 6 || floorEvents >= 2)
      && (dayVolume >= 0.25 || floorEvents >= 2)
      && (sourceQuality >= 6 || hasOfficialSurface(item))
      && breakdown.trust >= 42
    );
  }

  if (item.module === "airdrops") {
    return (
      item.crowd <= 62
      && (item.tasks?.length || 0) >= 2
      && hasOfficialSurface(item)
      && (breakdown.trust >= 56 || breakdown.fundingStrength >= 60 || breakdown.vcQuality >= 60)
    );
  }

  if (item.module === "narratives") {
    return (
      item.crowd <= 54
      && breakdown.trust >= 56
      && breakdown.xQuality >= 42
    );
  }

  return true;
}

function displayTitle(item) {
  if (item.module === "tokens" || item.module === "analyzer") return item.symbol.split("/")[0].toUpperCase();
  return item.name;
}

function displaySubtitle(item) {
  if (item.module === "tokens" || item.module === "analyzer") {
    return `${item.name} · ${tokenThemeLabel(item)}`;
  }
  return `${item.symbol} · ${item.category}`;
}

function avatarText(item) {
  return displayTitle(item).replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "AL";
}

function itemAvatar(item, size = "") {
  const sources = resolvedImageSources(item);
  const imageUrl = sources[0] || "";
  const fallbackChain = sources.slice(1).map((url) => encodeURIComponent(url)).join("|");
  return `
    <div class="token-avatar ${size} ${imageUrl ? "has-image" : ""}" style="${avatarSurfaceVars(item)}">
      <span>${avatarText(item)}</span>
      ${imageUrl ? `<img src="${imageUrl}" data-fallbacks="${fallbackChain}" alt="" loading="lazy" referrerpolicy="no-referrer" onload="this.parentElement.classList.add('has-image')" onerror="const list=(this.dataset.fallbacks||'').split('|').filter(Boolean); const next=list.shift(); if(next){ this.dataset.fallbacks=list.join('|'); this.src=decodeURIComponent(next); } else { this.remove(); this.parentElement.classList.remove('has-image'); }" />` : ""}
    </div>
  `;
}

function adjustedScore(item) {
  return Math.min(item.score, harshAlphaScore(item));
}

function rankComparator(a, b) {
  const scoreDelta = adjustedScore(b) - adjustedScore(a);
  if (scoreDelta) return scoreDelta;
  const edgeDelta = (b.walletSignal - b.crowd) - (a.walletSignal - a.crowd);
  if (edgeDelta) return edgeDelta;
  const riskDelta = a.risk - b.risk;
  if (riskDelta) return riskDelta;
  const freshnessOrder = { "Too Early": 0, Early: 1, "Heating Up": 2, Crowded: 3, "Too Late": 4 };
  return (freshnessOrder[a.freshness] ?? 9) - (freshnessOrder[b.freshness] ?? 9);
}

function compareBySort(a, b, sortKey = currentSortKey()) {
  const metric = {
    alpha: () => adjustedScore(b) - adjustedScore(a),
    fresh: () => freshnessValue(b.freshness) - freshnessValue(a.freshness),
    wallet: () => b.walletSignal - a.walletSignal,
    trust: () => trustComposite(b) - trustComposite(a),
    xSignal: () => qualityBreakdown(b).xQuality - qualityBreakdown(a).xQuality,
    lowCrowd: () => a.crowd - b.crowd,
    volume: () => (b.raw?.volume24h || b.nftRaw?.dayVolume || 0) - (a.raw?.volume24h || a.nftRaw?.dayVolume || 0),
    floor: () => (a.nftRaw?.floorAsk || Number.MAX_SAFE_INTEGER) - (b.nftRaw?.floorAsk || Number.MAX_SAFE_INTEGER),
    lowCopy: () => a.copyRisk - b.copyRisk,
    recent: () => String(b.lastHit || "").localeCompare(String(a.lastHit || "")),
  }[sortKey];
  const delta = metric ? metric() : 0;
  return delta || rankComparator(a, b);
}

function compareWalletsBySort(a, b, sortKey = currentSortKey("wallets")) {
  const byAlpha = walletAlphaScore(b) - walletAlphaScore(a);
  if (sortKey === "lowCopy") return (a.copyRisk - b.copyRisk) || byAlpha;
  if (sortKey === "recent") return String(b.lastHit || "").localeCompare(String(a.lastHit || "")) || byAlpha;
  return byAlpha || (b.score - a.score);
}

function scoreDriverLine(item) {
  const edge = item.walletSignal - item.crowd;
  const breakdown = qualityBreakdown(item);
  return `trust ${breakdown.trust} · founder ${breakdown.founderTrust} · vc ${breakdown.vcQuality} · ${edge >= 0 ? "+" : ""}${edge} wallet edge`;
}

function chainLabel(chainId = "") {
  const key = String(chainId).toLowerCase();
  return {
    solana: "Solana",
    base: "Base",
    ethereum: "Ethereum",
    arbitrum: "Arbitrum",
    bsc: "BNB Chain",
    polygon: "Polygon",
    avalanche: "Avalanche",
    blast: "Blast",
    linea: "Linea",
    sui: "Sui",
    sonic: "Sonic",
    sei: "Sei",
    berachain: "Berachain",
    hyperliquid: "Hyperliquid",
  }[key] || String(chainId || "Cross-chain").toUpperCase();
}

function liveTokenTheme(pair) {
  const text = [
    pair.baseToken?.name,
    pair.baseToken?.symbol,
    pair.info?.header,
    pair.info?.openGraph,
    ...(pair.info?.websites || []).map((site) => site?.url || ""),
  ].join(" ").toLowerCase();
  if (/\brwa\b|real.world|real world/.test(text)) return "RWA Token";
  if (/\bai\b|agent|compute|gpu|inference/.test(text)) return "AI Token";
  if (/privacy|zk|zero.?knowledge/.test(text)) return "Privacy Token";
  if (/game|gaming/.test(text)) return "Gaming Token";
  if (/depin|render|node/.test(text)) return "DePIN Token";
  if (/launch|pad/.test(text)) return "Launchpad Token";
  if (/meme|pepe|dog|cat|shib/.test(text)) return "Meme Token";
  if (/perp|dex|swap|amm|market/.test(text)) return "DeFi Token";
  return "Flow Setup";
}

function continuationProfile(pair) {
  const liquidity = Number(pair?.liquidity?.usd || 0);
  const volume24h = Number(pair?.volume?.h24 || 0);
  const buys1h = Number(pair?.txns?.h1?.buys || 0);
  const sells1h = Number(pair?.txns?.h1?.sells || 0);
  const buys24h = Number(pair?.txns?.h24?.buys || 0);
  const sells24h = Number(pair?.txns?.h24?.sells || 0);
  const price1h = Number(pair?.priceChange?.h1 || 0);
  const price24h = Number(pair?.priceChange?.h24 || 0);
  const pairAgeMinutes = pair?.pairCreatedAt ? Math.max(1, Math.round((Date.now() - pair.pairCreatedAt) / 60000)) : 9999;
  const volLiq = liquidity ? volume24h / liquidity : 0;
  const buyRatio1h = buys1h + sells1h ? buys1h / (buys1h + sells1h) : 0.5;
  const buyRatio24h = buys24h + sells24h ? buys24h / (buys24h + sells24h) : 0.5;
  const reclaimWindow = pairAgeMinutes >= 50 && pairAgeMinutes <= 4320;
  const reclaimScore = (
    (price1h > 6 ? 16 : price1h > 3 ? 10 : 0) +
    (price24h > 18 ? 12 : price24h > 8 ? 7 : 0) +
    (buyRatio1h > 0.6 ? 11 : buyRatio1h > 0.54 ? 6 : 0) +
    (buyRatio24h > 0.56 ? 8 : buyRatio24h > 0.52 ? 4 : 0) +
    (volLiq > 1.35 ? 10 : volLiq > 0.65 ? 6 : 0) +
    (liquidity > 4500 ? 7 : liquidity > 1800 ? 4 : 0) +
    (reclaimWindow ? 8 : 0)
  );
  return {
    pairAgeMinutes,
    volLiq,
    buyRatio1h,
    buyRatio24h,
    reclaimScore,
    reclaimLike: reclaimWindow && price1h > 3 && buyRatio1h > 0.54 && liquidity > 1200,
  };
}

function isWatched(id) {
  if (isGuestMode()) return false;
  return state.savedItems.includes(id);
}

function saveWatchlist() {
  if (isGuestMode()) return;
  localStorage.setItem("alphaLeak.itemWatchlist", JSON.stringify(state.savedItems));
}

function toggleWatchlist(id) {
  if (isGuestMode()) return;
  state.savedItems = isWatched(id)
    ? state.savedItems.filter((itemId) => itemId !== id)
    : [...state.savedItems, id];
  saveWatchlist();
}

function scoreSnapshot(items = []) {
  return Object.fromEntries(items.map((item) => [item.id, adjustedScore(item)]));
}

async function syncDiscoveryTimes() {
  try {
    const registry = await apiRequest("/api/discoveries", { method: "GET" });
    if (registry && typeof registry === "object") {
      state.detectedRegistry = { ...state.detectedRegistry, ...registry };
      renderOpportunities();
    }
  } catch (err) {
    console.warn("Failed to sync discovery times from MongoDB:", err);
  }
}

// Global initialization
async function init() {
  renderModules();
  renderFilters();
  renderSorts();
  renderProfile();
  
  // Initial render with cached/local data
  renderOpportunities();
  
  // Sync centralized times from MongoDB
  await syncDiscoveryTimes();
  
  // Existing polling...
  setInterval(refreshData, 30000);
  setInterval(updateScoreDeltasFromSnapshot, 5000);
  setInterval(emitOpportunityNotifications, 5000);
}

init();

function updateScoreDeltasFromSnapshot() {
  const next = scoreSnapshot(opportunities);
  Object.entries(next).forEach(([id, score]) => {
    const previous = notificationState.scoreSnapshot[id];
    if (typeof previous === "number" && previous !== score) {
      const diff = score - previous;
      // ONLY track and show deltas of 3 points or more to reduce noise
      if (Math.abs(diff) >= 3) {
        state.scoreDeltaMap[id] = diff;
        // Persist this indicator for 30 seconds
        setTimeout(() => {
          delete state.scoreDeltaMap[id];
        }, 30000);
      }
    }
  });
  notificationState.scoreSnapshot = next;
}

function primeNotificationRegistry() {
  notificationState.knownTokenIds = new Set(opportunities.filter((item) => item.module === "tokens").map((item) => item.id));
  notificationState.knownHighScoreIds = new Set(
    opportunities
      .filter((item) => ["tokens", "nfts"].includes(item.module))
      .filter((item) => adjustedScore(item) >= 80)
      .map((item) => item.id)
  );
  notificationState.scoreSnapshot = scoreSnapshot(opportunities);
  state.scoreDeltaMap = {};
  notificationState.primed = true;
}

function ensureAudioReady() {
  if (notificationState.audioUnlocked) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  notificationState.audioContext = notificationState.audioContext || new Ctx();
  notificationState.audioContext.resume?.().catch(() => {});
  notificationState.audioUnlocked = true;
}

function playNotificationTone(kind = "new") {
  if (!notificationState.audioUnlocked || !notificationState.audioContext) return;
  const ctx = notificationState.audioContext;
  const start = ctx.currentTime + 0.01;
  const notes = kind === "high"
    ? [
      { freq: 440, dur: 0.12, gain: 0.15 },
      { freq: 659.25, dur: 0.15, gain: 0.12, offset: 0.1 },
      { freq: 880, dur: 0.2, gain: 0.1, offset: 0.2 },
    ]
    : [
      { freq: 880, dur: 0.08, gain: 0.1 },
      { freq: 1174.66, dur: 0.1, gain: 0.12, offset: 0.06 },
    ];
  notes.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(note.freq, start + (note.offset || 0));
    gain.gain.setValueAtTime(0.0001, start + (note.offset || 0));
    gain.gain.exponentialRampToValueAtTime(note.gain, start + (note.offset || 0) + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + (note.offset || 0) + note.dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start + (note.offset || 0));
    osc.stop(start + (note.offset || 0) + note.dur + 0.02);
  });
}

function emitOpportunityNotifications() {
  const tokenIds = new Set(opportunities.filter((item) => item.module === "tokens").map((item) => item.id));
  const highScoreIds = new Set(
    opportunities
      .filter((item) => ["tokens", "nfts"].includes(item.module))
      .filter((item) => adjustedScore(item) >= 70)
      .map((item) => item.id)
  );
  if (!notificationState.primed) {
    notificationState.knownTokenIds = tokenIds;
    notificationState.knownHighScoreIds = highScoreIds;
    notificationState.primed = true;
    return;
  }
  const newTokens = [...tokenIds].filter((id) => !notificationState.knownTokenIds.has(id));
  
  // Update state immediately to avoid repeat triggers
  notificationState.knownTokenIds = tokenIds;
  notificationState.knownHighScoreIds = highScoreIds;

  if (newTokens.length) {
    const item = opportunities.find(o => o.id === newTokens[0]);
    const score = adjustedScore(item);
    const label = `
      <div class="toast-header">NEW ALPHA DISCOVERY</div>
      <div class="toast-body">${item?.symbol || "Token"} <span class="toast-pts">${score}pts</span></div>
    `;
    playNotificationTone("new");
    showCopyToast(label, 30000);
  } else {
    // Check for FRESH significant score increases (at least +2 pts)
    // CRITICAL: Only notify for tokens that would be VISIBLE in the current UI filter
    const currentDeltas = Object.entries(state.scoreDeltaMap)
      .filter(([id, diff]) => {
        if (diff < 2) return false;
        const item = opportunities.find(o => o.id === id);
        if (!item) return false;
        
        // Check if item passes the current UI filter
        const score = adjustedScore(item);
        if (state.filter === "high" && score < 70) return false;
        if (state.filter === "medium" && (score < 40 || score >= 70)) return false;
        if (state.filter === "low" && score >= 40) return false;
        
        return notificationState.knownTokenIds.has(id);
      });

    if (currentDeltas.length) {
      const [id, diff] = currentDeltas[0];
      const item = opportunities.find(o => o.id === id);
      const score = adjustedScore(item);
      
      // Use a more robust key that includes the current score to detect if it's REALLY a new event
      const notifiedKey = `surge:${id}:${diff}:${score}`;
      
      if (notificationState.lastNotifiedKey !== notifiedKey) {
        if (item) {
          const label = `
            <div class="toast-header">ALPHA SURGE DETECTED</div>
            <div class="toast-body">${item.symbol} <span class="toast-pts-plus">+${diff} PTS</span></div>
          `;
          playNotificationTone("high");
          showCopyToast(label, 25000);
          notificationState.lastNotifiedKey = notifiedKey;
        }
      }
    }
  }
}

function money(value) {
  if (!Number.isFinite(value)) return "N/A";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function tokenThemeLabel(item) {
  if (seededTokenThemeLabels[item.id]) return seededTokenThemeLabels[item.id];
  const category = String(item.category || "").toLowerCase();
  if (category.includes("sport")) return "Sports Token";
  if (category.includes("privacy") || category.includes("zk")) return "Privacy Token";
  if (category.includes("ai")) return "AI Compute";
  if (category.includes("rwa")) return "RWA Infra";
  if (category.includes("pow")) return "PoW L1";
  if (category.includes("l1")) return "L1 Token";
  if (category.includes("on-chain")) return "On-Chain Flow";
  if (category.includes("meme")) return "Meme Flow";
  if (category.includes("depin")) return "DePIN";
  return "Token";
}

function compactNumber(value) {
  const number = Number(value || 0);
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(1)}K`;
  return `${Math.round(number)}`;
}

function tokenContractAddress(item) {
  const direct = String(item?.raw?.tokenAddress || item?.raw?.address || item?.tokenAddress || "").trim();
  return /^0x[a-fA-F0-9]{40}$/.test(direct) ? direct : "";
}

function shortAddress(address = "") {
  const safe = String(address || "").trim();
  if (!safe) return "";
  if (safe.length <= 14) return safe;
  return `${safe.slice(0, 6)}...${safe.slice(-4)}`;
}

function contractChipMarkup(address = "", extraClass = "") {
  const safe = String(address || "").trim();
  if (!safe) return "";
  const className = ["contract-chip", extraClass].filter(Boolean).join(" ");
  return `
    <span class="${className}" title="${safe}">
      <span>${shortAddress(safe)}</span>
      <button class="copy-contract-btn" data-copy-contract="${safe}" type="button" aria-label="Copy contract address" title="Copy address">
        ${icons.copy}
      </button>
    </span>
  `;
}

function percent(value) {
  const number = Number(value || 0);
  return `${number > 0 ? "+" : ""}${number.toFixed(1)}%`;
}

function parsePercentValue(value) {
  return Number.parseFloat(String(value || "").replace(/[^\d.-]/g, "")) || 0;
}

function parseLeadMinutes(value) {
  const text = String(value || "");
  const hours = Number(text.match(/(\d+)\s*h/i)?.[1] || 0);
  const minutes = Number(text.match(/(\d+)\s*m/i)?.[1] || 0);
  return (hours * 60) + minutes;
}

function walletAlphaScore(wallet) {
  const roi = Math.min(100, parsePercentValue(wallet.profit) / 3.2);
  const winRate = Math.min(100, parsePercentValue(wallet.winRate));
  const leadTime = Math.min(100, parseLeadMinutes(wallet.leadTime) / 8.5);
  const earlyHits = Math.min(100, (Number.parseInt(wallet.earlySuccess, 10) || 2) * 17);
  const composite = (
    wallet.score * 0.42
    + roi * 0.18
    + winRate * 0.16
    + leadTime * 0.12
    + earlyHits * 0.12
    - wallet.copyRisk * 0.14
  );
  return Math.max(0, Math.min(100, Math.round(composite)));
}

function pseudoWalletAddress(wallet) {
  const hex = Array.from(`${wallet.id}-${wallet.address}-${wallet.label}`)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
  return `0x${(hex + "0".repeat(40)).slice(0, 40)}`;
}

function walletIsVerified(wallet) {
  return wallet.verified === true && /^0x[a-fA-F0-9]{40}$/.test(String(wallet.address || "").trim());
}

function normalizedWalletAddress(wallet) {
  const direct = String(wallet.address || "").trim();
  if (walletIsVerified(wallet)) return direct;
  const hint = direct.includes("...") ? direct.split("...") : ["", ""];
  const left = textToHex(hint[0] || wallet.label).replace(/^0x/i, "");
  const right = textToHex(hint[1] || wallet.id).replace(/^0x/i, "");
  const middle = textToHex(`${wallet.id}-${wallet.label}-${wallet.type}-${wallet.lastHit}`);
  const raw = `${left}${middle}${right}`.replace(/[^a-fA-F0-9]/g, "").toLowerCase();
  return `0x${(raw + "abcdef0123456789abcdef0123456789abcdef").slice(0, 40)}`;
}

function walletExplorerUrl(wallet) {
  if (!walletIsVerified(wallet)) return "";
  const direct = safeUrl(wallet.link);
  if (/etherscan\.io\/address\//i.test(direct)) return direct;
  const directMatch = direct.match(/0x[a-fA-F0-9]{40}/);
  if (directMatch) return `https://etherscan.io/address/${directMatch[0]}`;
  return `https://etherscan.io/address/${String(wallet.address || "").trim()}`;
}

function walletDisplayAddress(wallet) {
  return walletIsVerified(wallet) ? normalizedWalletAddress(wallet) : "Verification pending";
}

function minutesAgo(timestamp) {
  if (!timestamp) return "new";
  const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
  return minutes < 60 ? `${minutes}m ago` : `${Math.round(minutes / 60)}h ago`;
}

function chainExplorer(chainId, tokenAddress) {
  if (chainId === "solana") return `https://solscan.io/token/${tokenAddress}`;
  if (chainId === "base") return `https://basescan.org/token/${tokenAddress}`;
  if (chainId === "ethereum") return `https://etherscan.io/token/${tokenAddress}`;
  return `https://dexscreener.com/${chainId}/${tokenAddress}`;
}

function sourceRowsFromFeeds(...feeds) {
  const seen = new Set();
  return feeds
    .flat()
    .filter(Boolean)
    .filter((item) => item.chainId && item.tokenAddress)
    .filter((item) => {
      const key = `${item.chainId}:${item.tokenAddress}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => Number(a.chainId === "solana") - Number(b.chainId === "solana"));
}

function isRejectedLiveToken(pair) {
  const name = String(pair?.baseToken?.name || "").trim();
  const symbol = String(pair?.baseToken?.symbol || "").trim();
  const category = String(pair?.labels?.join(" ") || pair?.info?.header || "").trim();
  const text = `${name} ${symbol} ${category}`.toLowerCase();
  const genericTerms = new Set([
    "sol", "solana", "base", "eth", "ethereum", "bsc", "bnb", "line", "linea", "arb", "arbitrum",
    "avax", "avalanche", "polygon", "matic", "blast", "sui", "sei", "sonic", "bera", "berachain",
    "hyperliquid", "ai", "rwa", "depin", "zk", "privacy", "gaming", "agent", "meme", "perp", "launchpad",
  ]);
  const weakMemeTerms = new Set(["shiba", "pepe", "doge", "inu", "wojak", "floki", "cat", "frog"]);
  const narrativeOnlyTerms = new Set(["rwa", "ai", "depin", "zk", "privacy", "agent", "launchpad", "perp", "gaming"]);
  const chainTerms = new Set(["sol", "solana", "base", "eth", "ethereum", "line", "linea", "sui", "sei", "sonic", "blast", "bera", "berachain"]);
  const words = text.replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
  const onlyGenericWords = words.length > 0 && words.length <= 3 && words.every((word) => genericTerms.has(word));
  const repeatedGenericPattern = /^(sol|base|eth|line|ai|meme|agent)(\s|-)?(sol|base|eth|line|ai|meme|agent)$/i.test(text);
  const hasChainWord = words.some((word) => chainTerms.has(word));
  const hasWeakMemeWord = words.some((word) => weakMemeTerms.has(word));
  const allNarrativeWords = words.length > 0 && words.length <= 4 && words.every((word) => narrativeOnlyTerms.has(word) || chainTerms.has(word));
  return (
    /\b(scam|rug|honeypot|fake|test|wen|claim|airdrop)\b/.test(text)
    || name.length < 3
    || symbol.length < 2
    || onlyGenericWords
    || repeatedGenericPattern
    || (hasChainWord && hasWeakMemeWord)
    || allNarrativeWords
  );
}

function lowSignalSeedToken(item) {
  if (item.module !== "tokens") return false;
  const text = `${item.name} ${item.symbol} ${item.category}`.toLowerCase();
  const junkPattern = /\b(shiba|pepe|doge|inu|wojak|frog)\b/;
  const genericNarrativePattern = /\b(sui|solana|base|ethereum|rwa|ai|depin|agent)\b/;
  return (
    (junkPattern.test(text) && (item.risk >= 75 || item.crowd >= 50))
    || (genericNarrativePattern.test(text) && junkPattern.test(text))
  );
}

function liveTokenIdentityKey(pair) {
  const address = String(pair?.baseToken?.address || "").toLowerCase();
  if (address) return `${pair?.chainId || "x"}:${address}`;
  const symbol = String(pair?.baseToken?.symbol || "").trim().toLowerCase();
  const name = String(pair?.baseToken?.name || "").trim().toLowerCase();
  return `${pair?.chainId || "x"}:${symbol}:${name}`;
}

function liveTokenPairStrength(pair) {
  return (
    (pair?.liquidity?.usd || 0) * 0.9
    + (pair?.volume?.h24 || 0)
    + ((pair?.txns?.h24?.buys || 0) * 140)
    + ((pair?.txns?.h1?.buys || 0) * 320)
  );
}

function dedupeLiveTokenPairs(pairs = []) {
  const bestByToken = new Map();
  pairs.forEach((pair) => {
    const key = liveTokenIdentityKey(pair);
    const current = bestByToken.get(key);
    if (!current || liveTokenPairStrength(pair) > liveTokenPairStrength(current)) {
      bestByToken.set(key, pair);
    }
  });
  return [...bestByToken.values()];
}

function eth(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return "N/A";
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K ETH`;
  if (number >= 1) return `${number.toFixed(2)} ETH`;
  return `${number.toFixed(4)} ETH`;
}

function safeUrl(url) {
  return typeof url === "string" && url.startsWith("http") ? url : "";
}

function openseaProUrl(url) {
  const match = safeUrl(url).match(/opensea\.io\/collection\/([^/?#]+)/i);
  return match ? `https://pro.opensea.io/collection/${match[1]}` : "";
}

function xHandleFromUrl(url) {
  const match = safeUrl(url).match(/(?:x|twitter)\.com\/([^/?#]+)/i);
  return match ? match[1].replace(/^@/, "") : "";
}

function xLink(url) {
  const safe = safeUrl(url);
  if (!safe) return null;
  const handle = xHandleFromUrl(safe);
  return { label: handle ? `X @${handle}` : "X", url: safe };
}

function cleanSurfaceLabel(text = "") {
  return text.replace(/\bguide\b/gi, "Source").replace(/\btask guide\b/gi, "Task Source");
}

function cardLinks(item) {
  const links = itemLinksWithEnhancements(item);
  if (item.module !== "nfts") return links.slice(0, 3);
  const pro = links.find((link) => link.label === "OpenSea Pro");
  const market = links.find((link) => link.label !== "OpenSea Pro" && (link.label === "OpenSea" || link.label.startsWith("OpenSea ")));
  const x = links.find((link) => link.label.startsWith("X @") || link.label === "X");
  const direct = [pro, market, x].filter(Boolean);
  return direct.length ? direct.slice(0, 3) : links.slice(0, 3);
}

function projectLinks(item) {
  if (item.module !== "nfts") return [];
  const links = itemLinksWithEnhancements(item);
  const market = links.find((link) => link.label === "OpenSea" || (link.label.startsWith("OpenSea ") && link.label !== "OpenSea Pro"));
  const pro = links.find((link) => link.label === "OpenSea Pro");
  const x = links.find((link) => link.label.startsWith("X @") || link.label === "X");
  return [market, pro, x].filter(Boolean);
}

function sectionHeading(title) {
  return `
    <div class="section-title">
      <h4>${title}</h4>
      <i aria-hidden="true">${icons.arrow}</i>
    </div>
  `;
}

function renderProjectLinks(item) {
  const links = projectLinks(item);
  if (!links.length) return "";
  return `
    <section class="intel-section project-link-panel">
      ${sectionHeading("Project Links")}
      <div class="project-link-grid">
        ${links.map((link) => `
          <a href="${link.url}" target="_blank" rel="noreferrer">
            <span>${link.label.includes("X") ? "X account" : link.label.includes("Pro") ? "Pro market" : "Collection"}</span>
            <strong>${link.label}</strong>
          </a>
        `).join("")}
      </div>
    </section>
  `;
}

function renderTaskPlan(item) {
  if (item.module !== "airdrops" || !item.tasks?.length) return "";
  return `
    <section class="intel-section task-section">
      ${sectionHeading("Task Plan")}
      <div class="task-stack">
        ${item.tasks.map((task, index) => `
          <article class="task-card">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>${task.title}</strong>
              <p>${cleanSurfaceLabel(task.detail)}</p>
              <a href="${task.url}" target="_blank" rel="noreferrer">${cleanSurfaceLabel(task.label)}</a>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderRoleIntel(item) {
  if (item.module !== "airdrops" || !item.roleIntel?.length) return "";
  return `
    <section class="intel-section task-section role-intel-section">
      ${sectionHeading("Role Intel")}
      <div class="role-intel-grid">
        ${item.roleIntel.map((entry) => `
          <article class="role-intel-card">
            <div class="role-intel-head">
              <strong>${entry.name}</strong>
              <span>${entry.gate}</span>
            </div>
            <p>${cleanSurfaceLabel(entry.detail)}</p>
            <a href="${entry.url}" target="_blank" rel="noreferrer">${cleanSurfaceLabel(entry.label)}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderCatalystPanel(item) {
  if (!item.catalysts?.length) return "";
  return `
    <section class="intel-section catalyst-panel">
      ${sectionHeading("Catalyst Watch")}
      <div class="catalyst-grid">
        ${item.catalysts.map((catalyst) => {
          const finalLink = /coinmarketcap\.com\/events/i.test(catalyst.url) && coinMarketCalCoinUrl(item)
            ? { ...catalyst, label: "CoinMarketCal", url: coinMarketCalCoinUrl(item) }
            : catalyst;
          return `
          <article class="catalyst-card">
            <span>${finalLink.window}</span>
            <strong>${finalLink.title}</strong>
            <p>${cleanSurfaceLabel(finalLink.impact)}</p>
            <a href="${finalLink.url}" target="_blank" rel="noreferrer">${finalLink.label}</a>
          </article>
        `;}).join("")}
      </div>
    </section>
  `;
}

function buildLiveToken(pair, index) {
  const buys = pair.txns?.h1?.buys || 0;
  const sells = pair.txns?.h1?.sells || 0;
  const volume = pair.volume?.h24 || 0;
  const liquidity = pair.liquidity?.usd || 0;
  const marketCap = pair.marketCap || 0;
  const fdv = pair.fdv || 0;
  const h24Buys = pair.txns?.h24?.buys || 0;
  const ageMinutes = pair.pairCreatedAt ? Math.max(1, Math.round((Date.now() - pair.pairCreatedAt) / 60000)) : 999;
  const buyBias = buys + sells ? Math.round((buys / (buys + sells)) * 100) : 45;
  const early = ageMinutes < 80 ? "Too Early" : ageMinutes < 320 ? "Early" : "Heating Up";
  const risk = liquidity < 3000 ? 92 : liquidity < 12000 ? 78 : liquidity < 50000 ? 62 : 44;
  const socials = pair.info?.socials || [];
  const twitter = socials.find((link) => link.type === "twitter")?.url;
  const telegram = socials.find((link) => link.type === "telegram")?.url;
  const website = pair.info?.websites?.[0]?.url;
  const continuation = continuationProfile(pair);
  const crowdLevel = Math.min(88, Math.round(h24Buys / 58 + (twitter ? 16 : 6)));
  const publicSignal = Math.min(90, Math.round((twitter ? 36 : 16) + (volume / 17000)));
  const walletSignal = Math.min(92, Math.max(36, buyBias + Math.round(buys / 135) + (liquidity > 40000 ? 4 : 0)));
  const trustBoost = (twitter ? 5 : 0) + (website ? 6 : 0) + (liquidity > 40000 ? 8 : liquidity > 16000 ? 4 : 0);
  const volumePressure = Math.min(20, volume / 22000);
  const buyPressure = Math.min(18, buys / 120);
  const crowdPenalty = Math.max(0, (crowdLevel - 46) * 0.22);
  const riskPenalty = Math.max(0, (risk - 52) * 0.18);
  
  const vol1h = pair.volume?.h1 || 0;
  const volLiqRatio = liquidity > 0 ? vol1h / liquidity : 0;
  
  // Alpha Zone (Red) - Professional Launch ($40k+)
  const isAlphaZone = ageMinutes <= 15 && vol1h >= 40000;
  // Elite Start (Gold) - Elite/God-tier Launch ($90k+)
  const isEliteStart = ageMinutes <= 15 && vol1h >= 90000;
  
  const score = Math.max(52, Math.min(95, Math.round(56 + volumePressure + buyPressure + trustBoost + (continuation.reclaimScore * 0.45) + (isAlphaZone ? 12 : 0) + (isEliteStart ? 20 : 0) - crowdPenalty - riskPenalty)));
  
  const sourceLinks = [
    { label: `DEX ${pair.baseToken.symbol.toUpperCase()}`, url: pair.url },
    twitter ? { label: "X", url: twitter } : website ? { label: "Website", url: website } : null,
    telegram ? { label: "Telegram", url: telegram } : { label: "Explorer", url: chainExplorer(pair.chainId, pair.baseToken.address) },
  ].filter(Boolean);

  return {
    id: `live-token-${pair.chainId}-${pair.pairAddress || pair.baseToken.address}`,
    module: "tokens",
    name: pair.baseToken.name,
    symbol: pair.baseToken.symbol,
    imageUrl: pair.info?.imageUrl || pair.info?.openGraph,
    category: `${chainLabel(pair.chainId)} · ${isEliteStart ? "ELITE PRO LAUNCH" : (isAlphaZone ? "ALPHA ZONE SURGE" : liveTokenTheme(pair))}`,
    score,
    isAlphaZone,
    isEliteStart,
    freshness: early,
    action: isEliteStart ? "HIGH CONVICTION" : (isAlphaZone ? "RAPID ENTRY" : (score > 87 && crowdLevel < 54 ? "Research Now" : score > 74 && continuation.reclaimLike ? "Research Now" : score > 76 ? "Small Entry Only" : risk > 88 ? "Watch" : "Watch")),
    firstSeen: pair.pairCreatedAt ? `pair ${minutesAgo(pair.pairCreatedAt)} old` : "live pair",
    crowd: crowdLevel,
    xSignal: publicSignal,
    walletSignal,
    risk,
    liquidity: `${money(volume)} volume`,
    volumeSpike: isEliteStart ? "PROFESSIONAL VOLUME DETECTED" : (isAlphaZone ? "EXTREME VOLUME VELOCITY DETECTED" : (publicSignal > 62 ? "mentions and orderflow are both building" : "wallet flow is leading public discovery")),
    discord: "N/A",
    guides: 0,
    thesis: isEliteStart 
      ? `ELITE START: This token launched with massive backing ($${money(vol1h)} in first mins). High probability of a professional team or market maker behind the scenes.`
      : (isAlphaZone 
          ? `RAPID VOLUME SURGE: This token is exploding in its first minutes. Volume/Liquidity ratio is ${volLiqRatio.toFixed(2)}, indicating heavy conviction.`
          : `${early} ${chainLabel(pair.chainId)} setup: wallet flow is ${walletSignal > crowdLevel ? "still ahead of crowd" : "close to public attention"}, and the setup is ${risk > 80 ? "higher risk because liquidity is thin" : "tradeable if flow keeps holding"}.`),
    researchNote: isAlphaZone
      ? "ALPHA ZONE ALERT: High speed volume detected. Check contract security instantly and monitor orderbook for whale buys."
      : (continuation.reclaimLike
          ? "Continuation setup detected: check whether price reclaimed after a quiet base, volume is re-accelerating, and wallets are still buying before broad attention."
          : "Open the source link, check holders/makers, LP safety, contract risk, and whether real accounts are discussing it before any entry."),
    links: sourceLinks,
    positiveSignals: [isAlphaZone ? "Rapid volume growth" : "Still early enough to monitor", walletSignal > 65 ? "Wallet pressure is stronger than crowd pressure" : "Still early enough to monitor", twitter ? "Direct X account surfaced" : "Low public link density", liquidity > 15000 ? "Enough depth to monitor seriously" : "Very early size still matters"],
    negativeSignals: [liquidity < 5000 ? "Liquidity is extremely thin" : "Still microcap risk", crowdLevel > 65 ? "Crowd may already be arriving" : "Fresh pair can reverse instantly"],
    xIntel: { mentions1h: Math.round((twitter ? 18 : 6) + volume / 22000), mentions6h: Math.round((twitter ? 34 : 12) + volume / 14000), mentions24h: Math.round((twitter ? 70 : 20) + volume / 9000), quality: twitter ? 62 : website ? 52 : 42, botRate: twitter ? 16 : 26, influencerStarted: crowdLevel > 72 },
    walletIntel: { earlyEntries: Math.max(1, Math.round(buys / 420)), walletTypes: ["Fresh pair makers", "Fast wallets"], copyRisk: Math.min(92, risk - 22) },
    crowdIntel: { discordVelocity: "unknown", saturation: buys + sells > 5000 ? "High" : buys + sells > 1200 ? "Medium" : "Low", tutorialCount: 0 },
    raw: {
      chain: pair.chainId,
      dex: pair.dexId,
      tokenAddress: pair.baseToken?.address || "",
      pairAddress: pair.pairAddress || "",
      priceUsd: Number(pair.priceUsd || 0),
      marketCap,
      fdv,
      buys1h: buys,
      sells1h: sells,
    }
  };
}

function buildAnalyzerToken(pair, index = 0) {
  const item = buildLiveToken(pair, index);
  const ageMinutes = pair.pairCreatedAt ? Math.max(1, Math.round((Date.now() - pair.pairCreatedAt) / 60000)) : 0;
  const ageLabel = ageMinutes ? `${formatRelative(ageMinutes)} pair age` : "live pair";
  return {
    ...item,
    id: `analyzer-${pair.chainId}-${pair.pairAddress || pair.baseToken.address}`,
    module: "analyzer",
    category: `${chainLabel(pair.chainId)} · ${liveTokenTheme(pair)} · Analyzer`,
    firstSeen: ageLabel,
    thesis: `Analyzer readout for ${pair.baseToken.symbol.toUpperCase()}: live pair flow, liquidity, wallet pressure, crowd pressure and surface quality are being scored in real time without saving this setup into the terminal feed.`,
    researchNote: "Use this as a one-off deep read: confirm contract, liquidity, holder spread, maker flow, socials, and whether the move is still pre-crowd.",
    positiveSignals: [
      "Live Dex pair fetched directly",
      item.walletSignal > item.crowd ? "Wallet signal still leads public crowd" : "Public crowd already catching up",
      pair.info?.websites?.length ? "Official website surfaced" : "Sparse official surface",
    ],
    negativeSignals: [
      item.risk > 78 ? "Liquidity/risk profile is still dangerous" : "Still requires holder and contract review",
      ageMinutes > 2880 ? "This is no longer an ultra-fresh pair" : "Fresh pairs can reverse fast",
    ],
  };
}

function buildLiveNft(collection, index, floorEvents = []) {
  const stats = collection.volume || collection.stats || {};
  const floorAsk = collection.floorAsk?.price?.amount?.native || collection.floorAsk?.price?.amount?.decimal || collection.floorAsk?.price?.amount?.usd || 0;
  const dayVolume = stats["1day"] || stats["24h"] || collection.volume1d || collection.day1Volume || 0;
  const weekVolume = stats["7day"] || stats["7d"] || collection.volume7d || 0;
  const ownerCount = collection.ownerCount || collection.owners || 0;
  const tokenCount = collection.tokenCount || collection.supply || 0;
  const floorChange = collection.floorSaleChange?.["1day"] || collection.floorAskPercentChange?.["1day"] || collection.floorChange?.["1day"] || 0;
  const volumeChange = collection.volumeChange?.["1day"] || collection.volumePercentChange?.["1day"] || 0;
  const eventCount = floorEvents.filter((event) => {
    const contract = event.contract || event.collection?.id || event.collectionId;
    return contract && collection.id && String(contract).toLowerCase() === String(collection.id).toLowerCase();
  }).length;
  const supplyTightness = tokenCount ? Math.min(100, Math.round((ownerCount / tokenCount) * 100)) : 42;
  const hasExternal = Boolean(collection.externalUrl);
  const hasTwitter = Boolean(collection.twitterUsername);
  const walletSignal = Math.min(92, Math.round(42 + Math.min(26, dayVolume * 0.9) + Math.min(18, eventCount * 5) + Math.min(12, supplyTightness / 8) + (hasTwitter ? 6 : 0)));
  const crowd = Math.min(88, Math.round(16 + Math.min(34, dayVolume * 0.42) + Math.min(22, ownerCount / 600) + (hasTwitter ? 6 : 0)));
  const risk = Math.max(30, Math.min(92, Math.round(58 + (floorAsk > 1.2 ? 12 : 0) - Math.min(16, dayVolume / 5) + (ownerCount < 250 ? 14 : 0) - (hasExternal ? 4 : 0))));
  const freshness = crowd < 34 && walletSignal > 55 ? "Too Early" : crowd < 48 ? "Early" : crowd < 68 ? "Heating Up" : "Crowded";
  const score = Math.max(38, Math.min(92, Math.round(
    46
    + walletSignal * 0.26
    - crowd * 0.18
    - risk * 0.11
    + Math.min(10, Math.abs(floorChange) / 8)
    + Math.min(8, eventCount * 1.8)
    + (hasTwitter ? 3 : 0)
    + (hasExternal ? 3 : 0)
    - (dayVolume < 0.15 ? 18 : dayVolume < 0.5 ? 10 : dayVolume < 1 ? 5 : 0)
  )));
  const action = score > 84 && crowd < 52 ? "Research Now" : score > 72 ? "Watch" : risk > 80 ? "Avoid" : "Small Entry Only";
  const slug = collection.slug || collection.id || collection.name;
  const marketUrl = safeUrl(collection.marketplacePages?.[0]?.url) || `https://opensea.io/collection/${encodeURIComponent(slug)}`;
  const proUrl = openseaProUrl(marketUrl);
  const external = safeUrl(collection.externalUrl);
  const twitter = safeUrl(collection.twitterUsername ? `https://x.com/${collection.twitterUsername}` : "");
  const imageUrl = safeUrl(collection.image) || safeUrl(collection.imageUrl) || safeUrl(collection.metadata?.imageUrl) || "";
  return {
    id: `live-nft-${collection.id || slug}`,
    module: "nfts",
    name: collection.name || slug,
    symbol: collection.symbol || collection.slug || "NFT",
    imageUrl,
    category: `${chainLabel(collection.chainId || "ethereum")} collection flow`,
    score,
    freshness,
    action,
    firstSeen: "live NFT scan",
    crowd,
    xSignal: Math.min(90, Math.round(22 + (twitter ? 20 : 4) + Math.min(34, dayVolume * 0.55))),
    walletSignal,
    risk,
    liquidity: `${eth(floorAsk)} floor · ${eth(dayVolume)} volume`,
    volumeSpike: eventCount ? `${eventCount} floor events` : "wallet flow still building",
    discord: collection.discordUrl ? "linked" : "unknown",
    guides: crowd > 60 ? 5 : crowd > 40 ? 2 : 0,
    thesis: `${freshness} NFT window: wallet/floor pressure is ${walletSignal > crowd ? "ahead of crowd" : "close to crowd"}, floor event activity is ${eventCount ? "moving" : "thin"}, and public saturation is ${crowd > 60 ? "dangerous" : "still manageable"}.`,
    researchNote: "Check recent sales, holder distribution, listed supply, trait walls, and whether the same wallets are sweeping before acting.",
    links: [
      proUrl ? { label: "OpenSea Pro", url: proUrl } : null,
      { label: "OpenSea", url: marketUrl },
      external ? { label: "Website", url: external } : null,
      xLink(twitter),
    ].filter(Boolean),
    positiveSignals: [
      walletSignal > crowd ? "Wallet/floor pressure leads crowd score" : "Early enough to monitor",
      eventCount ? `${eventCount} recent floor events matched` : "Low visible floor-event noise",
      ownerCount && tokenCount ? `${compactNumber(ownerCount)} owners / ${compactNumber(tokenCount)} supply` : "Collection metadata resolved",
    ],
    negativeSignals: [
      floorAsk > 1 ? "Entry is not cheap" : "Micro-floor can be illiquid",
      crowd > 62 ? "Crowd saturation is rising" : "Needs holder/sales verification",
      dayVolume < 1 ? "Low 24h volume" : "Sweep risk can reverse",
    ],
    xIntel: { mentions1h: Math.round(4 + dayVolume / 2), mentions6h: Math.round(12 + dayVolume * 1.2), mentions24h: Math.round(24 + dayVolume * 3), quality: twitter ? 68 : 48, botRate: crowd > 60 ? 22 : 10, influencerStarted: crowd > 70 },
    walletIntel: { earlyEntries: Math.max(1, eventCount || Math.round(dayVolume / 12)), walletTypes: ["NFT sweepers", "Mint hunters", "Floor watchers"], copyRisk: Math.min(88, crowd + 12) },
    crowdIntel: { discordVelocity: collection.discordUrl ? "check live" : "unknown", saturation: crowd > 62 ? "High" : crowd > 42 ? "Medium" : "Low", tutorialCount: crowd > 60 ? 5 : crowd > 40 ? 2 : 0 },
    nftRaw: {
      floorAsk,
      dayVolume,
      weekVolume,
      ownerCount,
      tokenCount,
      eventCount,
      floorChange,
      volumeChange,
    },
  };
}

function buildOpenSeaDropNft(drop, index) {
  const floorAsk = drop.floor || drop.mint || 0;
  const dayVolume = drop.volume || 0;
  const ownerCount = drop.owners || Math.max(24, Math.round((drop.items || 400) * drop.ownerRatio));
  const tokenCount = drop.items || 0;
  const mintProgress = drop.minted && tokenCount ? Math.min(1, drop.minted / tokenCount) : 0;
  const sourceBoost = (drop.sourceQuality || 0) + (drop.verified ? 6 : 0) + (drop.utility ? 6 : 0) + (drop.creatorUrl ? 4 : 0) + (drop.verifiedXUrl ? 5 : 0);
  const walletSignal = Math.min(92, Math.round(44 + drop.wallet * 0.32 + Math.min(18, dayVolume * 0.45) + (drop.mint === 0 ? 6 : 0) + sourceBoost * 0.45 + mintProgress * 8));
  const crowd = Math.min(86, Math.round(drop.crowd + Math.min(18, dayVolume * 0.16) + (drop.items > 2500 ? 8 : 0) + mintProgress * 7));
  const risk = Math.min(88, Math.round(drop.risk + (dayVolume < 2 ? 8 : 0) + (drop.mint > 0.08 ? 9 : 0) - Math.min(10, sourceBoost * 0.35)));
  const freshness = crowd < 30 ? "Too Early" : crowd < 46 ? "Early" : crowd < 65 ? "Heating Up" : "Crowded";
  const hasOpenSea = Boolean(drop.openSeaUrl);
  const score = Math.max(36, Math.min(90, Math.round(
    44
    + walletSignal * 0.22
    - crowd * 0.17
    - risk * 0.12
    + (drop.mint === 0 ? 4 : 0)
    + Math.min(6, dayVolume * 1.2)
    + sourceBoost * 0.24
    + mintProgress * 4
    - (dayVolume < 0.15 ? 20 : dayVolume < 0.5 ? 12 : dayVolume < 1 ? 6 : 0)
    - (hasOpenSea ? 0 : 12)
  )));
  const action = score > 82 && crowd < 52 ? "Research Now" : score > 70 ? "Watch" : "Small Entry Only";
  const proUrl = openseaProUrl(drop.openSeaUrl);
  return {
    id: `opensea-drop-${drop.slug || encodeURIComponent(drop.name)}`,
    module: "nfts",
    name: drop.name,
    symbol: drop.creator || "OpenSea Drop",
    imageUrl: drop.imageUrl || "",
    category: drop.category,
    sourceQuality: drop.sourceQuality || 0,
    score,
    freshness,
    action,
    firstSeen: "OpenSea collection scan",
    crowd,
    xSignal: Math.min(90, Math.round(22 + drop.crowd * 0.52 + (drop.creator ? 8 : 0))),
    walletSignal,
    risk,
    liquidity: floorAsk ? `${eth(floorAsk)} ${drop.mint ? "mint/floor" : "floor"}` : "free / TBA",
    volumeSpike: dayVolume ? `${eth(dayVolume)} tracked flow` : drop.status,
    discord: "verify",
    guides: crowd > 58 ? 4 : crowd > 40 ? 2 : 0,
    thesis: `${freshness} NFT candidate from the project collection page: cheap or active mint, crowd is ${crowd > 58 ? "already warming" : "still manageable"}, and wallet pressure needs live sales/holder confirmation before acting.`,
    researchNote: "Open the marketplace and project account when available, then verify minter count, holder spread, unique buyers, floor depth, and whether fresh wallets are sweeping.",
    links: [
      proUrl ? { label: "OpenSea Pro", url: proUrl } : null,
      drop.openSeaUrl ? { label: "OpenSea", url: drop.openSeaUrl } : null,
      drop.openSeaDropUrl ? { label: "OpenSea Drops", url: drop.openSeaDropUrl } : null,
      drop.calendarUrl ? { label: "NFTCalendar", url: drop.calendarUrl } : null,
      drop.mintscanUrl ? { label: "MintScan", url: drop.mintscanUrl } : null,
      xLink(drop.verifiedXUrl),
      drop.creatorUrl ? { label: "Creator", url: drop.creatorUrl } : null,
    ].filter(Boolean),
    positiveSignals: [
      drop.mint === 0 ? "Free/zero-price mint signal" : "Low-cost mint/floor route",
      tokenCount ? `${compactNumber(tokenCount)} item supply` : "Upcoming mint surface",
      walletSignal > crowd ? "Wallet-pressure model leads crowd score" : "Needs wallet confirmation",
      drop.verified ? "Calendar source verified" : "Source still needs manual verification",
      drop.utility ? "Utility / access layer exists" : "Pure collectible thesis",
    ],
    negativeSignals: [
      "Live holder/sweeper verification required",
      crowd > 58 ? "May already be visible on OpenSea" : "Could be low-quality mint",
      risk > 70 ? "Thin liquidity / creator risk" : "Do not act without source check",
    ],
    xIntel: { mentions1h: Math.round(5 + drop.crowd / 5), mentions6h: Math.round(14 + drop.crowd), mentions24h: Math.round(35 + drop.crowd * 2.4), quality: 58 + Math.min(20, drop.wallet / 5), botRate: crowd > 60 ? 19 : 9, influencerStarted: crowd > 68 },
    walletIntel: { earlyEntries: Math.max(1, Math.round(drop.wallet / 18)), walletTypes: ["Mint hunters", "Floor sweepers", "OpenSea drop watchers"], copyRisk: Math.min(86, crowd + 10) },
    crowdIntel: { discordVelocity: "verify live", saturation: crowd > 60 ? "High" : crowd > 42 ? "Medium" : "Low", tutorialCount: crowd > 58 ? 4 : 1 },
    nftRaw: { floorAsk, dayVolume, weekVolume: dayVolume * 3, ownerCount, tokenCount, eventCount: Math.round(drop.wallet / 22), floorChange: 0, volumeChange: 0, sourceQuality: drop.sourceQuality || 0 },
  };
}

function fallbackNftUniverse() {
  const drops = [
    { name: "XSULLO: The Great Beyond", creator: "carte.gg / XSULLO", category: "Ethereum utility art mint", status: "minting now", mint: 0.0022, floor: 0.0045, items: 3000, minted: 1849, owners: 2683, ownerRatio: 0.89, volume: 2.87, wallet: 79, crowd: 46, risk: 42, verified: true, utility: true, sourceQuality: 10, openSeaUrl: "https://opensea.io/collection/foolsjourney/overview", calendarUrl: "https://nftcalendar.io/event/xsullo-beyond/", openSeaDropUrl: "https://opensea.io/drops", mintscanUrl: "https://waypoint.tools/mintscan/", creatorUrl: "https://www.carte.gg/" },
    { name: "Double Tap", creator: "OrangeHare", category: "Ethereum curated art drop", status: "mint ended", mint: 0.0015, floor: 0.005, items: 127, minted: 127, owners: 55, ownerRatio: 0.43, volume: 0.02, wallet: 58, crowd: 28, risk: 40, verified: true, utility: false, sourceQuality: 8, openSeaUrl: "https://opensea.io/collection/double-tap-415964536/overview", calendarUrl: "https://nftcalendar.io/event/double-tap-nft/", openSeaDropUrl: "https://opensea.io/drops", creatorUrl: "https://orangehare.io", verifiedXUrl: "https://x.com/OrangeHare_io" },
    { name: "JadeVault Genesis", creator: "JadeVault", category: "Polygon onchain material system", status: "mint window open", mint: 0.0035, floor: 0.0035, items: 2048, owners: 620, ownerRatio: 0.3, volume: 1.12, wallet: 73, crowd: 27, risk: 43, verified: true, utility: true, sourceQuality: 9, calendarUrl: "https://nftcalendar.io/b/polygon/", mintscanUrl: "https://waypoint.tools/mintscan/" },
    { name: "The Office Mfers", creator: "Office Terminal", category: "Ethereum utility collectible", status: "minting now", mint: 0.0042, floor: 0.0042, items: 888, owners: 214, ownerRatio: 0.24, volume: 0.84, wallet: 70, crowd: 25, risk: 49, verified: false, utility: true, sourceQuality: 7, calendarUrl: "https://nftcalendar.io/event/the-office-mfers/", mintscanUrl: "https://waypoint.tools/mintscan/" },
    { name: "Pixel Mandalas", creator: "Ethereum generative", category: "Free mint / invocation art", status: "gas-only mint", mint: 0, floor: 0.0012, items: 10220, owners: 430, ownerRatio: 0.04, volume: 0.51, wallet: 69, crowd: 22, risk: 55, verified: false, utility: true, sourceQuality: 7, calendarUrl: "https://nftcalendar.io/event/pixel-mandalas/", mintscanUrl: "https://waypoint.tools/mintscan/" },
    { name: "CreArt Adventure", creator: "CreArt Exhibition", category: "Base live onchain art ecosystem", status: "creator flow live", mint: 0.004, floor: 0.0048, items: 1111, owners: 286, ownerRatio: 0.26, volume: 1.46, wallet: 72, crowd: 30, risk: 45, verified: true, utility: true, sourceQuality: 8, calendarUrl: "https://nftcalendar.io/events/2026-03-24/", mintscanUrl: "https://waypoint.tools/mintscan/" },
    { name: "Unipeg", creator: "Ethereum mint", category: "Cheap Ethereum mint", status: "minting now", mint: 0.0004, floor: 0.001, items: 172, owners: 96, ownerRatio: 0.56, volume: 0.11, wallet: 66, crowd: 24, risk: 52, verified: false, utility: false, sourceQuality: 4, openSeaUrl: "https://opensea.io/collection/unipeg-522824176/overview", mintscanUrl: "https://waypoint.tools/mintscan/" },
    { name: "uPEG", creator: "0xHadrian", category: "Art collection floor watch", status: "secondary live", mint: 0, floor: 0.75, items: 105, owners: 78, ownerRatio: 0.74, volume: 0.64, wallet: 71, crowd: 29, risk: 58, verified: false, utility: false, sourceQuality: 5, openSeaUrl: "https://opensea.io/collection/unipegv4", verifiedXUrl: "https://x.com/0xHadrian", mintscanUrl: "https://waypoint.tools/mintscan/" },
  ];
  return drops
    .filter((drop) => safeUrl(drop.openSeaUrl))
    .filter((drop) => !safeUrl(drop.openSeaUrl).endsWith("/drops"))
    .filter((drop) => (drop.sourceQuality || 0) >= 6)
    .filter((drop) => (drop.volume || 0) >= 0.15)
    .map(buildOpenSeaDropNft)
    .sort(rankComparator);
}

function uniqueById(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function seededFreshTokenUniverse() {
  return seededOpportunities
    .filter((item) => item.module === "tokens")
    .filter((item) => item.raw || item.segment !== "CEX / Catalyst")
    .filter((item) => !["token-unicurve", "token-punkpeg"].includes(item.id))
    .filter(isVisibleOpportunity)
    .filter((item) => !lowSignalSeedToken(item))
    .map((item) => ({ ...item }))
    .sort(rankComparator);
}

function primeOpportunityUniverse() {
  const nonTokens = opportunities.filter((item) => item.module !== "tokens" && item.module !== "nfts");
  const tokenSeed = seededFreshTokenUniverse();
  const nftSeed = fallbackNftUniverse();
  opportunities = [...tokenSeed, ...nftSeed, ...nonTokens];
  rememberDiscoveries(opportunities);
  touchCallRegistry(opportunities);
}

async function refreshLiveTokens() {
  try {
    const previousTokens = opportunities.filter((item) => item.module === "tokens");
    const searchTerms = ["solana", "base", "ethereum", "arbitrum", "bsc", "avalanche", "polygon", "linea", "blast", "sui", "sei", "sonic", "berachain", "hyperliquid", "ai", "rwa", "depin", "zk", "privacy", "gaming", "agent", "meme", "perp", "launchpad"];
    const [latestBoosts, topBoosts, latestProfiles] = await Promise.all([
      fetch("https://api.dexscreener.com/token-boosts/latest/v1").then((response) => response.json()).catch(() => []),
      fetch("https://api.dexscreener.com/token-boosts/top/v1").then((response) => response.json()).catch(() => []),
      fetch("https://api.dexscreener.com/token-profiles/latest/v1").then((response) => response.json()).catch(() => []),
    ]);
    const grouped = sourceRowsFromFeeds(latestBoosts, topBoosts, latestProfiles)
      .reduce((chains, item) => {
        chains[item.chainId] = chains[item.chainId] || [];
        if (!chains[item.chainId].includes(item.tokenAddress)) chains[item.chainId].push(item.tokenAddress);
        return chains;
      }, {});
    const responses = await Promise.allSettled(Object.entries(grouped).map(([chain, addresses]) =>
      fetch(`https://api.dexscreener.com/tokens/v1/${chain}/${addresses.slice(0, 60).join(",")}`).then((response) => response.json())
    ));
    const pairs = responses
      .filter((response) => response.status === "fulfilled")
      .flatMap((response) => response.value);
    const searchResponses = await Promise.allSettled(searchTerms.map((term) =>
      fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(term)}`).then((response) => response.json())
    ));
    const searchedPairs = searchResponses
      .filter((response) => response.status === "fulfilled")
      .flatMap((response) => response.value?.pairs || []);
    const seenPairs = new Set();
    const uniquePairs = [...pairs, ...searchedPairs].filter((pair) => {
      const key = `${pair?.chainId}:${pair?.pairAddress || pair?.baseToken?.address}`;
      if (seenPairs.has(key)) return false;
      seenPairs.add(key);
      return true;
    });
    const uniqueTokens = dedupeLiveTokenPairs(uniquePairs);
    const chainCounts = {};
    const liveTokens = uniqueTokens
      .filter((pair) => pair?.baseToken?.symbol && pair.baseToken.symbol.length > 1 && pair.baseToken.name.length > 2)
      .filter((pair) => !isRejectedLiveToken(pair))
      .filter((pair) => {
        const continuation = continuationProfile(pair);
        return ((pair.volume?.h24 || 0) > 250 && (pair.liquidity?.usd || 0) > 500) || continuation.reclaimLike;
      })
      .filter((pair) => {
        const ageMinutes = pair.pairCreatedAt ? Math.max(1, Math.round((Date.now() - pair.pairCreatedAt) / 60000)) : 999;
        const move24h = Math.abs(pair.priceChange?.h24 || 0);
        return !(ageMinutes > 240 && move24h > 55) && !(ageMinutes > 480 && move24h > 95) && ageMinutes < 1440;
      })
      .sort((a, b) => {
        const aAge = a.pairCreatedAt || 0;
        const bAge = b.pairCreatedAt || 0;
        const aFlow = (a.txns?.h1?.buys || 0) * 800 + (a.volume?.h24 || 0) + (continuationProfile(a).reclaimScore * 900);
        const bFlow = (b.txns?.h1?.buys || 0) * 800 + (b.volume?.h24 || 0) + (continuationProfile(b).reclaimScore * 900);
        return (bFlow + bAge / 100000) - (aFlow + aAge / 100000);
      })
      .filter((pair) => {
        const cap = pair.chainId === "solana" ? 18 : 26;
        chainCounts[pair.chainId] = chainCounts[pair.chainId] || 0;
        if (chainCounts[pair.chainId] >= cap) return false;
        chainCounts[pair.chainId] += 1;
        return true;
      })
      .slice(0, 140)
      .map(buildLiveToken)
      .filter((item) => {
        const seenAt = detectedAt(item);
        if (!seenAt) return true;
        return (Date.now() - seenAt) / 60000 <= 360;
      })
      .filter((item) => {
        const reg = state.callRegistry[item.id];
        if (!reg) return true;
        const now = Date.now();
        if (reg.retiredUntil && reg.retiredUntil > now) return false;
        return true;
      });
    const freshSeedTokens = seededFreshTokenUniverse();
    const preservedTierOneCatalysts = opportunities
      .filter((item) => item.module === "tokens" && item.segment === "CEX / Catalyst")
      .filter(hasTierOneListingSignal)
      .slice(0, 3);
    const nonTokens = opportunities.filter((item) => item.module !== "tokens");
    if (!liveTokens.length) {
      opportunities = [...freshSeedTokens, ...nonTokens];
      rememberDiscoveries(opportunities);
      touchCallRegistry(opportunities);
      return true;
    }

    const liveIds = new Set(liveTokens.map((item) => item.id));
    const carried = previousTokens
      .filter((item) => item.id && !liveIds.has(item.id))
      .filter((item) => carryForwardToken(item))
      .slice(0, 48);

    const tokenUniverse = uniqueById([
      ...liveTokens,
      ...carried,
      ...preservedTierOneCatalysts,
    ]).slice(0, 120);

    opportunities = [...tokenUniverse, ...nonTokens];
    rememberDiscoveries(opportunities);
    touchCallRegistry(opportunities);
    return true;
  } catch (error) {
    const nonTokens = opportunities.filter((item) => item.module !== "tokens");
    opportunities = [...seededFreshTokenUniverse(), ...nonTokens];
    rememberDiscoveries(opportunities);
    touchCallRegistry(opportunities);
    console.warn("Live token refresh failed; using fresh token fallback.", error);
    return true;
  }
}

async function refreshLiveNfts() {
  try {
    const collectionUrls = [
      "https://api.reservoir.tools/collections/v7?sortBy=1DayVolume&limit=50",
      "https://api.reservoir.tools/collections/v7?sortBy=createdAt&limit=50",
      "https://api.reservoir.tools/collections/v7?sortBy=floorAskPrice&limit=50",
    ];
    const [collectionResponses, floorEventResponse] = await Promise.all([
      Promise.allSettled(collectionUrls.map((url) => fetch(url).then((response) => response.json()))),
      fetch("https://api.reservoir.tools/events/collections/floor-ask/v2?limit=50").then((response) => response.json()).catch(() => ({})),
    ]);
    const seen = new Set();
    const collections = collectionResponses
      .filter((response) => response.status === "fulfilled")
      .flatMap((response) => response.value?.collections || [])
      .filter((collection) => {
        const key = collection.id || collection.slug || collection.name;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    const floorEvents = floorEventResponse.events || floorEventResponse.data || [];
    const staleBluechips = /milady|pudgy|penguin|cryptopunks|bored ape|azuki|moonbirds|doodles/i;
    const liveNfts = collections
      .filter((collection) => collection.name && (collection.floorAsk || collection.volume || collection.stats))
      .map((collection, index) => buildLiveNft(collection, index, floorEvents))
      .filter((item) => !staleBluechips.test(item.name))
      .filter((item) => item.nftRaw.dayVolume >= 0.35 || item.nftRaw.eventCount >= 2 || (item.nftRaw.floorAsk > 0 && item.walletSignal >= 68))
      .filter((item) => item.nftRaw.ownerCount >= 35 || item.nftRaw.dayVolume >= 1.5 || item.nftRaw.eventCount >= 3)
      .sort(rankComparator)
      .slice(0, 90);
    const fallback = fallbackNftUniverse();
    const nextNfts = [...liveNfts, ...fallback]
      .filter((item, index, array) => array.findIndex((entry) => entry.name === item.name) === index)
      .sort(rankComparator)
      .slice(0, 90);
    if (!nextNfts.length) return false;
    opportunities = [...opportunities.filter((item) => item.module !== "nfts"), ...nextNfts];
    rememberDiscoveries(opportunities);
    return true;
  } catch (error) {
    const fallback = fallbackNftUniverse();
    opportunities = [...opportunities.filter((item) => item.module !== "nfts"), ...fallback];
    rememberDiscoveries(opportunities);
    console.warn("Live NFT refresh failed; using OpenSea drop fallback.", error);
    return true;
  }
}

async function refreshCatalystTokenMarkets() {
  try {
    const entries = Object.entries(seededTokenMarketIds);
    if (!entries.length) return false;
    const ids = entries.map(([, marketId]) => marketId).join(",");
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`);
    if (!response.ok) return false;
    const markets = await response.json();
    const byId = Object.fromEntries(markets.map((market) => [market.id, market]));
    let changed = false;
    opportunities = opportunities.map((item) => {
      const marketId = seededTokenMarketIds[item.id];
      const market = marketId ? byId[marketId] : null;
      if (!market) return item;
      changed = true;
      return {
        ...item,
        imageUrl: market.image || item.imageUrl,
        marketRaw: {
          volume24h: market.total_volume || 0,
          marketCap: market.market_cap || 0,
          price: market.current_price || 0,
          lastUpdated: market.last_updated || "",
        },
      };
    });
    return changed;
  } catch (error) {
    console.warn("Catalyst token market refresh failed.", error);
    return false;
  }
}

async function refreshSeededDexMetrics() {
  try {
    const targets = opportunities
      .filter((item) => item.module === "tokens")
      .map((item) => ({ item, dex: dexscreenerPairRef(dexscreenerLinkForItem(item)?.url || "") }))
      .filter(({ dex }) => dex?.chainId && dex?.pairAddress);

    if (!targets.length) return false;

    const uniqueTargets = [...new Map(
      targets.map((entry) => [`${entry.dex.chainId}:${entry.dex.pairAddress}`.toLowerCase(), entry.dex])
    ).values()];

    const responses = await Promise.allSettled(uniqueTargets.map((dex) =>
      fetch(`https://api.dexscreener.com/latest/dex/pairs/${dex.chainId}/${dex.pairAddress}`, {
        cache: "no-store",
      }).then((response) => (response.ok ? response.json() : null))
    ));

    const pairMap = new Map();
    responses.forEach((result, index) => {
      if (result.status !== "fulfilled") return;
      const pair = normalizeDexPairPayload(result.value);
      if (!pair) return;
      const key = `${uniqueTargets[index].chainId}:${uniqueTargets[index].pairAddress}`.toLowerCase();
      pairMap.set(key, pair);
    });

    if (!pairMap.size) return false;

    let changed = false;
    opportunities = opportunities.map((item) => {
      if (item.module !== "tokens") return item;
      const ref = dexscreenerPairRef(dexscreenerLinkForItem(item)?.url || "");
      if (!ref) return item;
      const pair = pairMap.get(`${ref.chainId}:${ref.pairAddress}`.toLowerCase());
      if (!pair) return item;
      changed = true;
      return mergeDexPairMetricsIntoItem(item, pair);
    });

    return changed;
  } catch (error) {
    console.warn("Seeded Dex metric refresh failed.", error);
    return false;
  }
}

function rankedItems() {
  if (state.activeModule === "analyzer") return analyzerItems();
  const filtered = opportunities
    .filter(isVisibleOpportunity)
    .filter((item) => item.module === state.activeModule)
    .filter((item) => !state.watchlistMode || isWatched(item.id))
    .filter(matchesSelectedFilters);
  const sorted = filtered.sort((a, b) => compareBySort(a, b, currentSortKey()));
  
  // Disable exclusive strict filtering: we want to see viable tokens even if strict ones exist.
  const viable = sorted.filter((item) => adjustedScore(item) >= 45);
  return viable.slice(0, moduleResultCap(state.activeModule));
}

function analyzerItems() {
  const items = [...state.analyzerResults];
  return items.sort((a, b) => compareBySort(a, b, currentSortKey("analyzer"))).slice(0, 24);
}

function allRanked() {
  return opportunities.filter(isVisibleOpportunity).sort(rankComparator);
}

function activeModuleItems() {
  if (state.activeModule === "analyzer") return analyzerItems();
  return opportunities
    .filter(isVisibleOpportunity)
    .filter((item) => item.module === state.activeModule)
    .sort((a, b) => compareBySort(a, b, currentSortKey()))
    .slice(0, moduleResultCap(state.activeModule));
}

function filteredWallets() {
  return [...wallets]
    .filter((wallet) => !state.watchlistMode || isWatched(wallet.id))
    .filter(matchesSelectedWalletFilters)
    .sort((a, b) => compareWalletsBySort(a, b, currentSortKey("wallets")));
}

function selectedValues(groupKey) {
  return state.selectedFilters[groupKey] || [];
}

function toggleFilterSelection(groupKey, option) {
  const current = selectedValues(groupKey);
  state.selectedFilters[groupKey] = current.includes(option)
    ? current.filter((value) => value !== option)
    : [...current, option];
  if (!state.selectedFilters[groupKey].length) delete state.selectedFilters[groupKey];
}

function clearFilters() {
  state.selectedFilters = {};
}

function matchesOption(item, option) {
  const trust = trustComposite(item);
  const profile = credibilityProfile(item);
  const floorAsk = item.nftRaw?.floorAsk || 0;
  switch (option) {
    case "Fresh Launch": return Boolean(item.raw) && ["Too Early", "Early"].includes(item.freshness);
    case "Major Catalyst": return profile.catalystQuality >= 55;
    case "Smart Wallet Lead": return item.walletSignal - item.crowd >= 12;
    case "Higher Trust": return trust >= 58;
    case "Low Crowd": return item.crowd < 45;
    case "Major Venue": return profile.listingTier >= 70;
    case "Fresh Mint": return item.nftRaw?.eventCount > 0 || /mint/i.test(item.category);
    case "Sweepers In": return item.walletSignal - item.crowd >= 10;
    case "Cheap Entry": return floorAsk > 0 && floorAsk <= 0.03;
    case "Founder Linked": return item.links.some((link) => link.label.startsWith("X @"));
    case "Hot Testnet": return item.segment === "Hot Testnet";
    case "Claim Live": return /claim/i.test(item.volumeSpike) || item.action === "Act Now";
    case "Apply Now": return /apply|access|form|beta/i.test(item.volumeSpike) || item.action === "Act Now";
    case "Quiet Crowd": return item.crowd < 42;
    case "Backed / Funded": return profile.fundingStrength >= 45 || profile.vcQuality >= 55;
    case "Trusted Team": return trust >= 60;
    case "Official Source": return item.links.some((link) => /X @|blog|docs|website|apply|testnet/i.test(link.label));
    case "Research Now":
    case "Watch":
      return item.action === option;
    default:
      return item.segment === option;
  }
}

function matchesSelectedFilters(item) {
  const groups = moduleFilterGroups[state.activeModule] || [];
  return groups.every((group) => {
    const values = selectedValues(group.key);
    if (!values.length) return true;
    return values.some((value) => matchesOption(item, value));
  });
}

function matchesSelectedWalletFilters(wallet) {
  const groups = moduleFilterGroups.wallets || [];
  return groups.every((group) => {
    const values = selectedValues(group.key);
    if (!values.length) return true;
    return values.some((value) => {
      if (value === "Low Copy Risk") return wallet.copyRisk < 35;
      if (value === "Token") return /token|microcap|cex|catalyst|rotation/i.test(wallet.type);
      if (value === "NFT") return /nft|mint|collection/i.test(wallet.type);
      if (value === "Airdrop") return /airdrop|task|testnet|quest/i.test(wallet.type);
      if (value === "Research") return /research|privacy|regional|ai/i.test(wallet.type);
      return true;
    });
  });
}

function renderNav() {
  qs("moduleNav").innerHTML = modules.map((module) => `
    <button class="nav-item ${state.activeModule === module.id ? "is-active" : ""}" data-module="${module.id}" type="button">
      <span class="nav-icon">${icons[module.icon]}</span>
      <span>${module.label}</span>
    </button>
  `).join("");
}

function renderBias() {
  const controls = [
    ["wallet", "Wallet bias"],
    ["freshness", "Freshness bias"],
    ["crowd", "Crowd penalty"],
  ];
  qs("biasControls").innerHTML = controls.map(([key, label]) => `
    <label class="range-field">
      <span>${label}</span>
      <input type="range" min="0" max="40" value="${state.bias[key]}" data-bias="${key}" />
      <strong>${state.bias[key]}</strong>
    </label>
  `).join("");
  qs("walletWatchlist").value = state.watchlist;
}

function activeAvatar() {
  return profileAvatars.find((avatar) => avatar.id === state.profile.avatar) || profileAvatars[0];
}

function connectedWalletOption() {
  return state.providers.find((entry) => entry.uuid === state.activeProviderUuid) || null;
}

function discoverWalletProviders() {
  const discovered = new Map();
  function onAnnounce(event) {
    const detail = event?.detail;
    if (!detail?.info || !detail?.provider || !detail?.info?.uuid) return;
    discovered.set(detail.info.uuid, detail);
    state.providers = [...discovered.values()].map((entry) => ({
      uuid: entry.info.uuid,
      name: entry.info.name || "Wallet",
      icon: entry.info.icon || "",
      rdns: entry.info.rdns || "",
      provider: entry.provider,
    })).sort((a, b) => a.name.localeCompare(b.name));
    render();
  }
  window.addEventListener("eip6963:announceProvider", onAnnounce);
  try {
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  } catch {}

  // Fallback: plain injected provider (no icons).
  if (!state.providers.length && window.ethereum) {
    state.providers = [{
      uuid: "injected",
      name: "Injected Wallet",
      icon: "",
      rdns: "",
      provider: window.ethereum,
    }];
  }
}

function renderAccountControls() {
  const authButton = qs("authButton");
  if (!authButton) return;
  const wallet = connectedWalletOption();
  const address = state.profile.walletAddress || "";
  const addressShort = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const totalUsd = state.balanceUsd > 0 ? money(state.balanceUsd) : "";
  const totalEth = state.balanceEth > 0 ? `${state.balanceEth.toFixed(state.balanceEth >= 10 ? 2 : 3)} ETH` : "";
  authButton.innerHTML = isGuestMode()
    ? `
      <span class="auth-button-avatar auth-button-avatar--ghost">${icons.wallet}</span>
      <div>
        <em>Private Access</em>
        <strong>Connect Wallet</strong>
      </div>
      <span class="auth-button-caret">▾</span>
    `
    : `
      <div class="auth-balance">
        <strong>${totalUsd || totalEth || "—"}</strong>
        <em>${addressShort}</em>
      </div>
      <span class="auth-divider" aria-hidden="true"></span>
      <span class="auth-button-avatar"><img src="${activeAvatar().src}" alt="" /></span>
      <span class="auth-button-caret">▾</span>
    `;
  authButton.classList.toggle("is-connected", !isGuestMode());
}

function watchlistEntries() {
  return state.savedItems
    .map((id) => opportunities.find((item) => item.id === id) || wallets.find((wallet) => wallet.id === id))
    .filter(Boolean)
    .slice(0, 8);
}

function renderAccountModal() {
  const overlay = qs("accountOverlay");
  const modal = qs("accountModal");
  if (!overlay || !modal) return;
  const mode = state.accountModal;
  overlay.classList.toggle("is-visible", Boolean(mode));
  overlay.setAttribute("aria-hidden", mode ? "false" : "true");
  if (!mode) {
    modal.innerHTML = "";
    return;
  }
  if (mode === "login") {
    const providers = state.providers.length ? state.providers : [];
    modal.innerHTML = `
      <section class="account-dialog wallet-dialog">
        <button class="account-close" data-account-close type="button" aria-label="Close">×</button>
        <p class="account-dialog-kicker">Private Access</p>
        <h3>Connect Wallet</h3>
        <div class="wallet-list-block">
          <span>Installed</span>
          <div class="wallet-list">
            ${providers.length ? providers.map((wallet) => `
              <button class="wallet-option ${state.activeProviderUuid === wallet.uuid ? "is-active" : ""}" data-wallet-connect="${wallet.uuid}" type="button">
                <span class="wallet-option-icon wallet-option-icon--img">
                  ${wallet.icon ? `<img src="${wallet.icon}" alt="${wallet.name}"/>` : `<span>${wallet.name.slice(0, 1)}</span>`}
                </span>
                <div>
                  <strong>${wallet.name}</strong>
                  <em>Installed</em>
                </div>
              </button>
            `).join("") : `<div class="search-empty">No injected wallets detected yet.</div>`}
          </div>
        </div>
        <div class="wallet-footer-note">
          <span>Wallet auth needs the Vercel API runtime. On the plain static preview, backend login will stay offline.</span>
        </div>
      </section>
    `;
    return;
  }
  const avatar = activeAvatar();
  const wallet = connectedWalletOption();
  const watchlist = watchlistEntries();
  modal.innerHTML = `
    <section class="account-dialog profile-dialog">
      <button class="account-close" data-account-close type="button" aria-label="Close">×</button>
      <p class="account-dialog-kicker">Profile</p>
      <div class="profile-hero">
        <div class="profile-avatar-large"><img src="${avatar.src}" alt="" /></div>
        <div>
          <h3>${state.profile.displayName || "Operator"}</h3>
          <p>${wallet?.name || "Wallet"} · ${state.profile.walletAddress}</p>
        </div>
      </div>
      <label class="profile-field">
        <span>Display Name</span>
        <input id="profileNameInput" type="text" maxlength="24" value="${state.profile.displayName || ""}" placeholder="Set your operator name" />
      </label>
      <div class="profile-avatar-grid">
        ${profileAvatars.map((entry) => `
          <button class="profile-avatar-choice ${entry.id === state.profile.avatar ? "is-active" : ""}" data-avatar-choice="${entry.id}" type="button" title="${entry.label}">
            <span><img src="${entry.src}" alt="${entry.label}" /></span>
            <strong>${entry.label}</strong>
          </button>
        `).join("")}
      </div>
      <section class="profile-watchlist-panel">
        <div class="profile-section-head">
          <strong>My Watchlist</strong>
          <span>${watchlist.length}</span>
        </div>
        <div class="profile-watchlist-list">
          ${watchlist.length ? watchlist.map((entry) => `
            <article>
              <strong>${entry.name || entry.label}</strong>
              <span>${entry.module ? moduleCopy[entry.module] : entry.type}</span>
            </article>
          `).join("") : `<p>No watchlist items yet.</p>`}
        </div>
      </section>
      <div class="profile-actions">
        ${isGuestMode() ? `<button class="profile-action-button" data-open-login type="button">Connect Wallet</button>` : `<button class="profile-action-button secondary" data-profile-logout type="button">Disconnect</button>`}
      </div>
    </section>
  `;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: response.ok ? "Invalid JSON response" : "Backend offline" };
    }
  }
  if (!response.ok) {
    throw new Error(payload?.error || `API ${response.status}`);
  }
  return payload;
}

function applyServerSession(payload) {
  const profile = payload?.profile;
  if (!profile) return;
  state.profile = {
    ...state.profile,
    isLoggedIn: true,
    walletKey: state.profile.walletKey,
    walletName: profile.wallet_name || state.profile.walletName || "",
    displayName: profile.display_name || state.profile.displayName || "Operator",
    avatar: profile.avatar || state.profile.avatar || "signal",
    walletAddress: profile.address || state.profile.walletAddress || "",
  };
  state.savedItems = Array.isArray(payload.watchlist) ? payload.watchlist : [];
}

async function refreshPortfolioSnapshot() {
  const provider = resolveInjectedProvider(state.activeProviderUuid) || window.ethereum;
  const address = state.profile.walletAddress;
  if (!provider || !address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return;
  try {
    const balanceHex = await provider.request({ method: "eth_getBalance", params: [address, "latest"] });
    const balanceWei = BigInt(balanceHex || "0x0");
    const eth = Number(balanceWei) / 1e18;
    state.balanceEth = eth;
    const price = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : null)
      .catch(() => null);
    const usd = price?.ethereum?.usd ? eth * Number(price.ethereum.usd) : 0;
    state.balanceUsd = usd;
  } catch {}
}

function resolveInjectedProvider(uuid = "") {
  const entry = state.providers.find((provider) => provider.uuid === uuid);
  if (entry?.provider) return entry.provider;
  return window.ethereum || null;
}

async function connectWalletFlow(providerUuid = "") {
  const wallet = state.providers.find((entry) => entry.uuid === providerUuid);
  const provider = resolveInjectedProvider(providerUuid);
  if (!provider) {
    throw new Error("Wallet Missing");
  }
  const [address] = await provider.request({ method: "eth_requestAccounts" });
  if (!address) throw new Error("Wallet address missing");
  const noncePayload = await apiRequest("/api/auth/nonce", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
  const signature = await provider.request({
    method: "personal_sign",
    params: [noncePayload.message, address],
  });
  const session = await apiRequest("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({
      address,
      message: noncePayload.message,
      signature,
      walletKey: providerUuid,
      walletName: wallet?.name || "Wallet",
      avatar: state.profile.avatar,
      displayName: state.profile.displayName,
    }),
  });
  state.profile.walletKey = providerUuid;
  state.profile.walletAddress = address;
  state.activeProviderUuid = providerUuid;
  applyServerSession(session);
}

async function hydrateSession() {
  try {
    const session = await apiRequest("/api/me", { method: "GET" });
    applyServerSession(session);
    if (state.profile.walletKey) state.activeProviderUuid = state.profile.walletKey;
    refreshPortfolioSnapshot().finally(() => render());
    render();
  } catch {}
}

async function persistProfile() {
  if (isGuestMode()) return;
  try {
    const payload = await apiRequest("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({
        displayName: state.profile.displayName,
        avatar: state.profile.avatar,
      }),
    });
    if (payload?.profile) {
      state.profile.displayName = payload.profile.display_name || state.profile.displayName;
      state.profile.avatar = payload.profile.avatar || state.profile.avatar;
    }
  } catch {}
}

async function syncWatchlist(method, itemId) {
  if (isGuestMode()) return;
  try {
    const payload = await apiRequest("/api/watchlist", {
      method,
      body: JSON.stringify({ itemId }),
    });
    state.savedItems = Array.isArray(payload.watchlist) ? payload.watchlist : state.savedItems;
  } catch {
    showCopyToast("Sync Failed");
  }
}

function renderFilters() {
  if (state.activeModule === "analyzer") {
    const sorts = sortOptions.analyzer;
    const activeSort = sorts.find((option) => option.id === currentSortKey("analyzer")) || sorts[0];
    qs("filterCluster").innerHTML = `
      <div class="filter-tools analyzer-tools">
        <div class="analyzer-hint">Search above with token name or contract. Results stay local to this page and do not enter the main feed.</div>
        <div class="sort-stack">
          <button class="sort-combobox ${state.sortMenuOpen ? "is-open" : ""}" data-sort-toggle type="button">
            <span>Sort By</span>
            <strong>${activeSort.label}</strong>
          </button>
          ${state.sortMenuOpen ? `
            <div class="sort-panel">
              ${sorts.map((option) => `<button class="sort-option ${activeSort.id === option.id ? "is-active" : ""}" data-sort-option="${option.id}" type="button">${option.label}</button>`).join("")}
            </div>
          ` : ""}
        </div>
      </div>
    `;
    return;
  }
  const groups = moduleFilterGroups[state.activeModule] || [];
  const count = Object.values(state.selectedFilters).reduce((sum, values) => sum + values.length, 0);
  const summary = Object.values(state.selectedFilters).flat();
  const sorts = sortOptions[state.activeModule] || sortOptions.tokens;
  const activeSort = sorts.find((option) => option.id === currentSortKey()) || sorts[0];
  qs("filterCluster").innerHTML = `
    <div class="filter-tools">
      <div class="filter-stack">
        <button class="filter-combobox ${state.filterMenuOpen ? "is-open" : ""}" data-filter-toggle type="button">
          <span>Filters</span>
          <strong>${count ? `${count} Active` : "All"}</strong>
        </button>
        ${state.filterMenuOpen ? `
          <div class="filter-panel">
            <div class="filter-panel-head">
              <strong>Filter Stack</strong>
              <div class="filter-panel-actions">
                <small>${count ? `${count} Active` : "No Filters"}</small>
                <button type="button" data-filter-clear>Clear</button>
              </div>
            </div>
            ${groups.map((group) => `
              <section class="filter-group">
                <span>${group.label}</span>
                <div class="filter-option-grid">
                  ${group.options.map((option) => `
                    <label class="filter-option ${selectedValues(group.key).includes(option) ? "is-checked" : ""}">
                      <input type="checkbox" data-filter-group="${group.key}" value="${option}" ${selectedValues(group.key).includes(option) ? "checked" : ""} />
                      <em>${option}</em>
                    </label>
                  `).join("")}
                </div>
              </section>
            `).join("")}
          </div>
        ` : ""}
      </div>
      <div class="sort-stack">
        <button class="sort-combobox ${state.sortMenuOpen ? "is-open" : ""}" data-sort-toggle type="button">
          <span>Sort By</span>
          <strong>${activeSort.label}</strong>
        </button>
        ${state.sortMenuOpen ? `
          <div class="sort-panel">
            ${sorts.map((option) => `<button class="sort-option ${activeSort.id === option.id ? "is-active" : ""}" data-sort-option="${option.id}" type="button">${option.label}</button>`).join("")}
          </div>
        ` : ""}
      </div>
    </div>
    ${summary.length ? `<div class="filter-summary">${summary.map((value) => `<span>${value}</span>`).join("")}</div>` : ""}
  `;
}

function renderWatchlistButton() {
  const button = qs("watchlistButton");
  button.querySelector("strong").textContent = isGuestMode() ? "0" : `${state.savedItems.length}`;
  button.classList.toggle("is-active", state.watchlistMode);
  button.classList.toggle("is-locked", isGuestMode());
  button.title = isGuestMode() ? "Login required" : "Watchlist";
}

function analyzerSummaryTitle() {
  return state.searchQuery.trim() ? `Analyzer Results · ${state.searchQuery.trim()}` : "Analyzer Results";
}

function renderCockpitTitle() {
  const title = qs("cockpitTitle");
  if (!title) return;
  title.textContent = state.activeModule === "analyzer" ? analyzerSummaryTitle() : "Today's Alpha Candidates";
}

function renderSearchDropdown() {
  const dropdown = qs("searchDropdown");
  const query = state.searchQuery.trim();
  if (!dropdown) return;
  if (!state.searchOpen || query.length < 2) {
    dropdown.classList.remove("is-open");
    dropdown.innerHTML = "";
    return;
  }
  dropdown.classList.add("is-open");
  if (state.searchLoading) {
    dropdown.innerHTML = `<div class="search-empty">Searching live token surface...</div>`;
    return;
  }
  if (!state.searchResults.length) {
    dropdown.innerHTML = `<div class="search-empty">No live token matches yet.</div>`;
    return;
  }
  dropdown.innerHTML = state.searchResults.slice(0, 8).map((pair) => `
    <button class="search-result" data-search-result="${pair.chainId}:${pair.pairAddress || pair.baseToken?.address}" type="button">
      <div class="search-result-main">
        <div class="search-result-top">
          <strong>${pair.baseToken?.symbol || "TOKEN"}</strong>
          ${pair.baseToken?.address ? `<span class="contract-chip compact" title="${pair.baseToken.address}">${shortAddress(pair.baseToken.address)}</span>` : ""}
          ${pair.baseToken?.address ? `
            <button class="copy-contract-button" data-copy-contract="${pair.baseToken.address}" type="button" title="Copy full contract" aria-label="Copy full contract">
              ⧉
            </button>
          ` : ""}
        </div>
        <span>${pair.baseToken?.name || "Unknown token"} · ${chainLabel(pair.chainId)}</span>
      </div>
      <div class="search-result-meta">
        <em>${money(pair.marketCap || pair.fdv || 0)}</em>
        <span>${money(pair.volume?.h24 || 0)} vol</span>
      </div>
    </button>
  `).join("");
}

function uniqueSearchPairs(pairs = []) {
  return dedupeLiveTokenPairs(
    pairs
      .filter((pair) => pair?.baseToken?.symbol && pair?.baseToken?.name)
      .filter((pair) => !isRejectedLiveToken(pair))
      .filter((pair) => (pair.liquidity?.usd || 0) > 400 || (pair.volume?.h24 || 0) > 600)
  );
}

function setAnalyzerResultsFromPairs(pairs = [], preferredId = "") {
  const next = uniqueSearchPairs(pairs).slice(0, 18).map(buildAnalyzerToken);
  state.analyzerResults = next;
  if (!next.length) {
    state.selectedId = "";
    state.detailId = "";
    return;
  }
  const selected = preferredId ? next.find((item) => item.id === preferredId) : null;
  state.selectedId = selected?.id || next[0].id;
  state.detailId = "";
}

async function performTokenSearch(query) {
  const clean = String(query || "").trim();
  state.searchQuery = clean;
  if (clean.length < 2) {
    state.searchLoading = false;
    state.searchOpen = false;
    state.searchResults = [];
    if (state.activeModule === "analyzer") state.analyzerResults = [];
    render();
    return;
  }

  const requestId = ++latestSearchRequest;
  state.searchLoading = true;
  state.searchOpen = true;
  render();

  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(clean)}`);
    const payload = await response.json();
    if (requestId !== latestSearchRequest) return;
    const pairs = uniqueSearchPairs(payload?.pairs || []);
    state.searchResults = pairs;
    state.searchLoading = false;
    state.searchOpen = true;
    render();
  } catch (error) {
    if (requestId !== latestSearchRequest) return;
    console.warn("Analyzer search failed.", error);
    state.searchResults = [];
    state.searchLoading = false;
    state.searchOpen = true;
    if (state.activeModule === "analyzer") state.analyzerResults = [];
    render();
  }
}

function openAnalyzerResult(resultKey = "") {
  const pairs = state.searchResults;
  if (!pairs.length) return;
  const selectedPair = uniqueSearchPairs(pairs).find((pair) => `${pair.chainId}:${pair.pairAddress || pair.baseToken?.address}` === resultKey) || uniqueSearchPairs(pairs)[0];
  if (!selectedPair) return;
  const selected = buildAnalyzerToken(selectedPair);
  state.activeModule = "analyzer";
  state.selectedFilters = {};
  state.watchlistMode = false;
  state.filterMenuOpen = false;
  state.sortMenuOpen = false;
  state.searchOpen = false;
  state.analyzerResults = [selected];
  state.selectedId = selected?.id || "";
  state.detailId = "";
}

function alphaBurstItems() {
  if (!["tokens", "nfts"].includes(state.activeModule)) return [];
  return opportunities
    .filter(isVisibleOpportunity)
    .filter((item) => item.module === state.activeModule)
    .filter(matchesSelectedFilters)
    .filter((item) => adjustedScore(item) >= 80)
    .sort((a, b) => compareBySort(a, b, currentSortKey()))
    .slice(0, 8);
}

function alphaBurstCard(item) {
  return `
    <button class="alpha-burst-card" data-card-id="${item.id}" data-module-theme="${item.module}" style="${themeVars(item.module)}" type="button">
      <span class="alpha-burst-score">${adjustedScore(item)}</span>
      <div class="alpha-burst-copy">
        <strong>${displayTitle(item)}</strong>
        <em>${item.freshness} · ${item.action}</em>
      </div>
      <span class="alpha-burst-module">${item.module === "tokens" ? "Token" : "NFT"}</span>
    </button>
  `;
}

function renderAlphaBurstStrip() {
  const strip = qs("alphaBurstStrip");
  if (!strip) return;
  const items = alphaBurstItems();
  strip.classList.toggle("is-hidden", !items.length);
  if (!items.length) {
    strip.innerHTML = "";
    return;
  }
  strip.innerHTML = `
    <div class="alpha-burst-head">
      <span>80+ Burst</span>
      <strong>${state.activeModule === "tokens" ? "High Conviction Tokens" : "High Conviction NFTs"}</strong>
    </div>
    <div class="alpha-burst-track">
      ${items.map(alphaBurstCard).join("")}
    </div>
  `;
}

function renderRankingRule() {
  return null;
}

function sparkline(values, tone = "cyan") {
  const max = Math.max(...values, 1);
  const pointsArray = values.map((value, index) => {
    const x = index * (100 / (values.length - 1));
    const y = 42 - (value / max) * 34;
    return { x, y };
  });
  const points = pointsArray.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const areaPoints = `0,46 ${points} 100,46`;

  return `
    <svg class="sparkline ${tone}" viewBox="0 0 100 46" preserveAspectRatio="none" aria-hidden="true">
      <polygon points="${areaPoints}"></polygon>
      <polyline points="${points}"></polyline>
      ${pointsArray.map((point) => `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="1.6"></circle>`).join("")}
    </svg>
  `;
}

function mentionSeries(item) {
  const patterns = {
    "Too Early": [6, 7, 8, 11, 15, 22, 31],
    Early: [9, 12, 18, 29, 44, 58, 64],
    "Heating Up": [18, 24, 37, 55, 73, 86, 78],
    Crowded: [71, 84, 91, 88, 82, 77, 74],
    "Too Late": [92, 88, 79, 61, 43, 29, 18],
  };
  const base = patterns[item.freshness] || patterns.Early;
  const offset = (item.walletSignal + item.xSignal + item.risk) % 11;
  return base.map((value, index) => Math.max(3, Math.min(100, value + ((index % 2 === 0 ? offset : -offset) * 0.55))));
}

function walletSeries(item) {
  const base = [item.walletSignal * 0.32, item.walletSignal * 0.45, item.walletSignal * 0.58, item.walletSignal * 0.72, item.walletSignal * 0.8, item.walletSignal * 0.94, item.walletSignal];
  const pressure = item.crowd > 55 ? -6 : 7;
  return base.map((value, index) => Math.max(4, Math.min(100, value + (index > 3 ? pressure : index * 2))));
}

function sourceName(item) {
  const sources = {
    tokens: "Live source links + contract links",
    nfts: "Direct collection links + NFT flow",
    airdrops: "Official task links + claim/testnet verification",
    analyzer: "Live Dex pair + contract analysis",
    wallets: "Smart wallet source ranking",
  };
  return sources[item.module] || "Source links";
}

function renderAlphaMap() {
  const items = activeModuleItems().slice(0, 8);
  const placements = [
    { left: 14, bottom: 84 },
    { left: 30, bottom: 75 },
    { left: 15, bottom: 50 },
    { left: 43, bottom: 58 },
    { left: 72, bottom: 64 },
    { left: 58, bottom: 34 },
    { left: 84, bottom: 44 },
    { left: 91, bottom: 18 },
  ];
  qs("alphaMap").innerHTML = `
    <div class="map-axis x">Crowd pressure</div>
    <div class="map-axis y">Signal quality</div>
    <div class="map-zone map-zone-alpha">Early alpha</div>
    <div class="map-zone map-zone-hype">Crowded hype</div>
    <div class="map-zone map-zone-noise">Noise</div>
    ${items.map((item, index) => {
      const placement = placements[index];
      return `
        <button class="map-dot ${state.selectedId === item.id ? "is-active" : ""} ${actionClass[item.action]}" data-map-id="${item.id}" style="left:${placement.left}%; bottom:${placement.bottom}%;" type="button" aria-label="${item.name}">
          <span>${adjustedScore(item)}</span>
          <em>${item.name}</em>
        </button>
      `;
    }).join("")}
  `;
}

function renderClarityPanel() {
  const item = opportunities.find((entry) => entry.id === state.selectedId) || activeModuleItems()[0];
  const earlyScore = Math.max(0, 100 - item.crowd);
  qs("clarityPanel").innerHTML = `
    <div class="panel-head">
      <div>
        <p class="section-kicker">Decision Readout</p>
        <h3>${item.name}</h3>
      </div>
      <span class="action-badge ${actionClass[item.action]}">${item.action}</span>
    </div>
    <div class="readout-grid">
      <div class="radial-gauge" style="--value:${adjustedScore(item)}">
        <strong>${adjustedScore(item)}</strong>
        <span>conviction</span>
      </div>
      <div class="readout-copy">
        <p>${actionGuidance[item.action]}</p>
        <div class="quick-reasons">
          <span>Early edge ${earlyScore}</span>
          <span>Wallet proof ${item.walletSignal}</span>
          <span>Bot rate ${item.xIntel.botRate}%</span>
        </div>
      </div>
    </div>
    <div class="timeline-track" aria-label="Freshness track">
      ${["Too Early", "Early", "Heating Up", "Crowded", "Too Late"].map((label) => `
        <span class="${item.freshness === label ? "is-current" : ""}">${label}</span>
      `).join("")}
    </div>
  `;
}

function metricBar(label, value, tone = "") {
  return `
    <div class="metric-row">
      <div><span>${label}</span><strong>${value}</strong></div>
      <div class="meter"><span class="${tone}" style="width:${value}%"></span></div>
    </div>
  `;
}

function cardMetricSet(item) {
  const base = [
    ["Window", item.freshness, "window"],
    ["Edge", item.action, "edge"],
  ];
  if (item.module === "tokens" || item.module === "analyzer") {
    const marketCap = item.raw?.marketCap
      ? money(item.raw.marketCap)
      : item.raw?.fdv
        ? money(item.raw.fdv)
        : item.marketRaw?.marketCap
          ? money(item.marketRaw.marketCap)
          : "N/A";
    const volume24h = item.raw?.volume24h
      ? money(item.raw.volume24h)
      : item.marketRaw?.volume24h
        ? money(item.marketRaw.volume24h)
        : "N/A";
    return [
      ...base,
      ["MCap", marketCap, "mcap"],
      ["24H Vol", volume24h, "volume"],
    ];
  }
  if (item.module === "airdrops") {
    const trust = trustComposite(item);
    return [
      ...base,
      ["Trust", trust > 65 ? "High" : trust > 45 ? "Medium" : "Thin", "trust"],
      ["Funding", credibilityProfile(item).fundingStrength > 40 ? "Backed" : "Thin", "funding"],
    ];
  }
  if (item.module === "narratives") {
    const trust = trustComposite(item);
    return [
      ...base,
      ["Trust", trust > 65 ? "High" : trust > 45 ? "Medium" : "Thin", "trust"],
      ["Crowd", item.crowd > 60 ? "Mainstream" : item.crowd > 38 ? "Building" : "Quiet", "crowd"],
    ];
  }
  if (item.nftRaw) {
    return [
      ...base,
      ["Floor", eth(item.nftRaw.floorAsk), "floor"],
      ["24H Vol", eth(item.nftRaw.dayVolume), "volume"],
    ];
  }
  return [
    ...base,
    ["Crowd", item.crowd > 65 ? "Crowded" : item.crowd > 38 ? "Building" : "Quiet", "crowd"],
    ["Risk", item.risk > 80 ? "High" : item.risk > 55 ? "Medium" : "Low", "risk"],
  ];
}

function metricTiles(item, limit = 4) {
  const groups = [];
  const metrics = cardMetricSet(item).slice(0, limit);
  for (let i = 0; i < metrics.length; i += 2) groups.push(metrics.slice(i, i + 2));
  return `
    <div class="signal-panels">
      ${groups.map((group) => `
        <div class="signal-panel">
          ${group.map(([label, value, tone]) => `
            <div class="signal-cell tone-${tone || label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">
              <span>${label}</span>
              <strong>${value}</strong>
            </div>
          `).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function decisionBlock(item) {
  return `
    <div class="decision-banner ${actionClass[item.action]}">
      <span>Action</span>
      <i aria-hidden="true"></i>
      <strong>${item.action}</strong>
    </div>
  `;
}

function scoreBreakdownMarkup(item) {
  const breakdown = qualityBreakdown(item);
  const profile = credibilityProfile(item);
  const fundingVC = Math.round((breakdown.fundingStrength + breakdown.vcQuality) / 2);
  const rows = [
    ["X Signal (organic reach)", breakdown.xQuality, "cyan"],
    ["Wallet Signal (smart entries)", item.walletSignal, "green"],
    ["Trust Stack (team + backers)", breakdown.trust, "violet"],
    ["Funding / VC (capital quality)", fundingVC, "yellow"],
    ["Crowd Level (how public)", item.crowd, "orange"],
    ["Risk Level (execution / liquidity)", item.risk, "red"],
  ];
  return `
    <section class="intel-section score-breakdown-panel">
      ${sectionHeading("Why This Surfaced")}
      <p>${profile.founderNote || "Composite score balances live signal with team, funding, trust, crowd and risk."}</p>
      <div class="drawer-grid">
        ${rows.map(([label, value, tone]) => metricBar(label, value, tone)).join("")}
      </div>
    </section>
  `;
}

function lastNewsTitle(item) {
  if (item.catalysts?.length) return item.catalysts.slice(0, 2).map((entry) => entry.title).join(" · ");
  if (item.module === "airdrops") return item.tasks?.[0]?.title || item.volumeSpike;
  if (item.module === "narratives") return item.catalysts?.[0]?.title || item.volumeSpike;
  if (item.nftRaw) return item.nftRaw.eventCount ? `${item.nftRaw.eventCount} floor events hit` : item.volumeSpike;
  if (item.raw) return item.links?.some((link) => /^X\b|^X @/i.test(link.label)) ? "No major news yet · pure flow" : "No direct news yet · pure flow";
  return item.volumeSpike;
}

function detailStatTiles(item) {
  if (item.module === "tokens" || item.module === "analyzer") {
    const volume = item.raw?.volume24h ? money(item.raw.volume24h) : item.marketRaw?.volume24h ? money(item.marketRaw.volume24h) : "Live check";
    const marketCap = item.raw?.marketCap ? money(item.raw.marketCap) : item.raw?.fdv ? money(item.raw.fdv) : item.marketRaw?.marketCap ? money(item.marketRaw.marketCap) : "N/A";
    return [
      ["Volume (Last 24H)", volume],
      ["Last News", lastNewsTitle(item)],
      ["Market Cap", marketCap],
      ["Token Theme", tokenThemeLabel(item)],
    ];
  }
  if (item.module === "nfts") {
    return [
      ["Floor & Volume", item.nftRaw ? `${eth(item.nftRaw.floorAsk)} · ${eth(item.nftRaw.dayVolume)}` : item.liquidity],
      ["Last News", lastNewsTitle(item)],
      ["Owners / Supply", item.nftRaw ? `${compactNumber(item.nftRaw.ownerCount)} / ${compactNumber(item.nftRaw.tokenCount)}` : "Verify"],
      ["Collection Type", item.category],
    ];
  }
  if (item.module === "airdrops") {
    return [
      ["Setup", item.segment || "Airdrop"],
      ["Last Update", lastNewsTitle(item)],
      ["Trust", trustComposite(item) > 65 ? "High" : trustComposite(item) > 45 ? "Medium" : "Thin"],
      ["Role Surface", /role|discord/i.test(item.researchNote || "") ? "Role gated" : "Open flow"],
    ];
  }
  return [
    ["Theme", item.segment || item.category],
    ["Last News", lastNewsTitle(item)],
    ["Trust", trustComposite(item) > 65 ? "High" : trustComposite(item) > 45 ? "Medium" : "Thin"],
    ["Positioning", item.action],
  ];
}

function renderXIntelSection(item) {
  return `
    <section class="intel-section x-intel-panel">
      ${sectionHeading("X Intelligence")}
      <div class="x-intel-grid">
        <article class="x-intel-card"><span>1H Mentions</span><strong>${item.xIntel.mentions1h}</strong></article>
        <article class="x-intel-card"><span>6H Mentions</span><strong>${item.xIntel.mentions6h}</strong></article>
        <article class="x-intel-card"><span>Account Quality</span><strong>${item.xIntel.quality}</strong></article>
        <article class="x-intel-card"><span>Bot Rate</span><strong>${item.xIntel.botRate}%</strong></article>
      </div>
      <div class="intel-chip-row">
        <span class="binary-signal ${item.xIntel.influencerStarted ? "bad" : "good"}">${item.xIntel.influencerStarted ? "Influencer shill started" : "No major influencer shill yet"}</span>
        <span class="binary-signal">${item.walletIntel.earlyEntries} early wallet clusters</span>
      </div>
    </section>
  `;
}

function renderExpandedDetails(item) {
  return `
    <div class="expanded-detail">
      <div class="expanded-head">
        ${decisionBlock(item)}
        <div class="expanded-copy">
          <p class="decision-explainer">${actionGuidance[item.action]}</p>
          <p class="score-logic">${scoreDriverLine(item)}</p>
          <p class="capture-line">${detailSeenLabel(item)}</p>
          ${callLineMarkup(item)}
        </div>
      </div>

      ${renderProjectLinks(item)}
      ${renderTaskPlan(item)}
      ${renderRoleIntel(item)}
      ${renderCatalystPanel(item)}
      ${scoreBreakdownMarkup(item)}

      <div class="fact-grid">
        ${detailStatTiles(item).map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}
      </div>

      ${renderXIntelSection(item)}

      <section class="intel-section source-panel">
        ${sectionHeading("Open Sources")}
        <div class="source-links drawer-links">
          ${itemLinksWithEnhancements(item).map((link) => `<a href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`).join("")}
        </div>
      </section>
    </div>
  `;
}

function sectionHeader(title, label, copy) {
  return `
    <div class="list-section-header">
      <span>${label}</span>
      <strong>${title}</strong>
      <p>${copy}</p>
    </div>
  `;
}

function cardMarkup(item, index) {
  const score = adjustedScore(item);
  const contract = (item.module === "tokens" || item.module === "analyzer") ? tokenContractAddress(item) : "";
  const guest = isGuestMode();
  return `
    <article class="alpha-card ${item.isEliteStart ? "is-elite-start" : (item.isAlphaZone ? "is-alpha-zone" : "")}" data-card-id="${item.id}" data-module-theme="${item.module}" style="${themeVars(item.module)}">
      ${item.isEliteStart ? '<div class="elite-start-badge">ELITE START</div>' : (item.isAlphaZone ? '<div class="alpha-zone-badge">ALPHA ZONE</div>' : '')}
      <div class="card-main">
        <div class="card-title-row">
          <div class="card-identity">
            ${itemAvatar(item)}
            <div>
            <div class="card-kicker">
              <span class="signal-tag ${item.isEliteStart ? "is-elite" : (item.isAlphaZone ? "is-rapid" : actionClass[item.action])}">${item.isEliteStart ? "HIGH CONVICTION" : (item.isAlphaZone ? "RAPID SURGE" : item.action)}</span>
              <em>${discoveryLabel(item)}</em>
            </div>
            <div class="card-name-line">
              <h4>${displayTitle(item)}</h4>
              ${contractChipMarkup(contract)}
            </div>
            <p>${displaySubtitle(item)}</p>
            </div>
          </div>
          <div class="card-top-actions">
            <div class="watch-score-row">
              <button class="watch-star ${isWatched(item.id) ? "is-watched" : ""} ${guest ? "is-locked" : ""}" data-watch-id="${item.id}" type="button" aria-label="${guest ? "Login required" : isWatched(item.id) ? "Remove from watchlist" : "Add to watchlist"}" title="${guest ? "Login required" : "Watchlist"}">
                ${icons.star}
              </button>
              <div class="score-pill-group">
                ${scoreDeltaMarkup(item.id)}
                <span class="card-score-pill" style="${scoreBadgeVars(score)}"><strong>${score}</strong></span>
              </div>
            </div>
            <span class="status-chip ${freshnessClass[item.freshness]}">${item.freshness}</span>
          </div>
        </div>
        <p class="thesis">${item.thesis}</p>
        ${metricTiles(item, 4)}
        <div class="mini-metrics">
          <span>${icons.x} X ${item.xSignal}</span>
          <span>${icons.wallet} Wallet ${item.walletSignal}</span>
          <span>Crowd ${item.crowd}</span>
          <span>Risk ${item.risk}</span>
        </div>
      </div>
      <div class="card-footer">
        <span class="rank-badge">#${index + 1} ${item.chainId?.toUpperCase() || ""}</span>
        <div class="source-row-links">
          ${cardLinks(item).map((link) => `<a href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`).join("")}
        </div>
      </div>
    </article>
  `;
}

function walletCardMarkup(wallet, index) {
  const riskClass = wallet.copyRisk > 60 ? "hot" : wallet.copyRisk < 35 ? "cool" : "";
  const score = walletAlphaScore(wallet);
  const walletClass = wallet.alphaRate === "Elite" ? "early" : wallet.alphaRate === "High" ? "heating" : wallet.alphaRate === "Crowded" ? "crowded" : "watch";
  const explorerUrl = walletExplorerUrl(wallet);
  const guest = isGuestMode();
  return `
    <article class="wallet-discovery-card" data-module-theme="wallets" style="${themeVars("wallets")}">
      <div class="card-title-row wallet-card-title-row">
        <div class="card-identity">
          <div class="token-avatar">
            <span>${wallet.label.replace(/[^A-Z0-9]/g, "").slice(0, 2) || "SW"}</span>
          </div>
          <div>
            <div class="card-kicker">
              <span class="signal-tag watch">${wallet.earlySuccess}</span>
              <em>${wallet.type}</em>
            </div>
            <h4>${wallet.label}</h4>
            <p class="wallet-address-line">${walletDisplayAddress(wallet)}</p>
          </div>
        </div>
        <div class="card-top-actions">
          <div class="watch-score-row">
            <button class="watch-star ${isWatched(wallet.id) ? "is-watched" : ""} ${guest ? "is-locked" : ""}" data-watch-id="${wallet.id}" type="button" aria-label="${guest ? "Login required" : isWatched(wallet.id) ? "Remove from watchlist" : "Add to watchlist"}" title="${guest ? "Login required" : "Watchlist"}">
              ${icons.star}
            </button>
            <span class="card-score-pill" style="${scoreBadgeVars(score)}">${scoreDeltaMarkup(wallet.id)}<strong>${score}</strong></span>
          </div>
          <span class="status-chip ${walletClass}">${wallet.alphaRate}</span>
        </div>
      </div>
      <div class="wallet-mini-grid">
        <div><span>30D ROI</span><strong>${wallet.profit}</strong></div>
        <div><span>Win Rate</span><strong>${wallet.winRate}</strong></div>
        <div><span>Lead Time</span><strong>${wallet.leadTime}</strong></div>
        <div><span>Copy Risk</span><strong>${wallet.copyRisk}</strong></div>
      </div>
      <p class="thesis">${wallet.lastHit}</p>
      <div class="wallet-risk-block">
        <div class="wallet-bar-heading">
          <strong>Copy Risk Map</strong>
          <i aria-hidden="true"></i>
        </div>
        <div class="wallet-risk-line">
          <span class="${riskClass}" style="width:${Math.max(8, wallet.copyRisk)}%"></span>
        </div>
      </div>
      <div class="card-footer">
        <span class="rank-badge">#${index + 1}</span>
        <div class="source-row-links">
          ${explorerUrl
            ? `<a href="${explorerUrl}" target="_blank" rel="noreferrer">Open Wallet</a>`
            : `<span class="wallet-link-disabled">Verification Pending</span>`}
        </div>
      </div>
    </article>
  `;
}

function renderSmartWalletModule() {
  const rankedWallets = filteredWallets();
  qs("opportunityList").innerHTML = `
    ${rankedWallets.map(walletCardMarkup).join("") || `<div class="empty-state">No wallet clusters match this filter.</div>`}
  `;
}

function crossCardMarkup(item, index) {
  const edge = item.walletSignal - item.crowd;
  return `
    <article class="cross-signal-card" data-card-id="${item.id}">
      <div class="cross-card-top">
        <span class="rank-badge">#${index + 1}</span>
        <strong>${adjustedScore(item)}</strong>
      </div>
      <div class="cross-flow">
        <span>${item.walletSignal} Wallet</span>
        <i></i>
        <span>${item.crowd} Crowd</span>
      </div>
      <h4>${displayTitle(item)}</h4>
      <p>${displaySubtitle(item)}</p>
      <div class="cross-edge ${edge > 20 ? "hot" : ""}">
        <strong>${edge >= 0 ? "+" : ""}${edge}</strong>
        <span>wallet-crowd edge</span>
      </div>
      <div class="cross-meta">
        <span>${item.module.toUpperCase()}</span>
        <span>${item.freshness}</span>
        <span>${item.action}</span>
      </div>
      <div class="source-row-links">
        ${cardLinks(item).map((link) => `<a href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`).join("")}
      </div>
    </article>
  `;
}

function renderCrossSignalModule() {
  const items = rankedItems();
  qs("opportunityList").innerHTML = `
    ${sectionHeader("Cross Signal", "Highest conviction", "Shows only overlaps where wallet confirmation appears before crowd saturation. Click any card for links, catalysts, tasks, and risk notes.")}
    ${items.map(crossCardMarkup).join("") || `<div class="empty-state">No cross-signal hits match this filter.</div>`}
  `;
}

function renderOpportunityList() {
  if (state.activeModule === "analyzer") {
    const items = analyzerItems();
    qs("opportunityList").innerHTML = items.length
      ? items.map(cardMarkup).join("")
      : `<div class="empty-state">Search above with a token name or contract. We will pull the live Dex surface and score it here without saving it into the feed.</div>`;
    return;
  }
  if (state.activeModule === "wallets") {
    renderSmartWalletModule();
    return;
  }
  const items = rankedItems();
  if (!items.length) {
    qs("opportunityList").innerHTML = `<div class="empty-state">No opportunities match this filter.</div>`;
    return;
  }
  if (state.activeModule === "airdrops") {
    const hot = items.filter((item) => item.segment === "Hot Testnet");
    const rest = items.filter((item) => item.segment !== "Hot Testnet");
    qs("opportunityList").innerHTML = [...hot.map((item, index) => cardMarkup(item, index)), ...rest.map((item, index) => cardMarkup(item, hot.length + index))].join("");
    return;
  }
  qs("opportunityList").innerHTML = items.map(cardMarkup).join("");
}

function renderDetailOverlay() {
  const overlay = qs("detailOverlay");
  if (!overlay) return;
  const item = [...opportunities, ...state.analyzerResults].find((entry) => entry.id === state.detailId);
  document.body.classList.toggle("has-detail-overlay", Boolean(item));
  if (!item) {
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = "";
    return;
  }

  overlay.setAttribute("aria-hidden", "false");
  overlay.innerHTML = `
    <div class="detail-backdrop" data-detail-close></div>
    <section class="detail-modal" style="${themeVars(item.module)}" role="dialog" aria-modal="true" aria-label="${displayTitle(item)} details">
      <button class="detail-close" data-detail-close type="button" aria-label="Close details" title="Close">
        ${icons.x}
      </button>
      <div class="detail-modal-hero">
        <div class="detail-identity">
          ${itemAvatar(item, "large")}
          <div>
            <h3>${displayTitle(item)}</h3>
            ${item.module === "tokens" || item.module === "analyzer"
              ? `<strong class="detail-name">${item.name}</strong><span>${tokenThemeLabel(item)} · ${detailSeenLabel(item)}</span>`
              : `<span>${displaySubtitle(item)} · ${detailSeenLabel(item)}</span>`}
          </div>
        </div>
        <div class="detail-score">
          <strong>${adjustedScore(item)}</strong>
          <span>Composite</span>
        </div>
      </div>
      ${renderExpandedDetails(item)}
    </section>
  `;
}

function renderDrawer() {
  qs("intelDrawer").innerHTML = "";
}

function renderWallets() {
  qs("walletTable").innerHTML = wallets.map((wallet) => `
    <div class="wallet-row">
      <div>
        <strong>${wallet.label}</strong>
        <a href="${wallet.link}" target="_blank" rel="noreferrer">${wallet.address}</a>
        <span>${wallet.type} · ${wallet.lastHit} · ${wallet.earlySuccess} early success</span>
      </div>
      <div class="wallet-score">${wallet.score}</div>
      <div class="copy-risk ${wallet.copyRisk > 70 ? "hot" : ""}">Copy risk ${wallet.copyRisk}</div>
    </div>
  `).join("");
}

function renderOverlaps() {
  const overlaps = allRanked().filter((item) => item.walletSignal > 60 && item.crowd < 45).slice(0, 4);
  qs("overlapStack").innerHTML = overlaps.map((item) => `
    <div class="overlap-card">
      <div>
        <strong>${item.name}</strong>
        <span>${item.walletIntel.earlyEntries} smart wallet entries · crowd ${item.crowd}</span>
      </div>
      <span class="status-chip ${freshnessClass[item.freshness]}">${item.freshness}</span>
    </div>
  `).join("");
}

function render() {
  const items = state.activeModule === "analyzer" ? analyzerItems() : rankedItems();
  if (!items.some((item) => item.id === state.selectedId) && items[0]) state.selectedId = items[0].id;
  if (state.detailId && ![...opportunities, ...state.analyzerResults].some((item) => item.id === state.detailId)) state.detailId = "";
  applyActiveTheme();
  renderNav();
  renderBias();
  renderAccountControls();
  renderCockpitTitle();
  renderFilters();
  renderWatchlistButton();
  renderSearchDropdown();
  renderAlphaBurstStrip();
  renderOpportunityList();
  renderDetailOverlay();
  renderAccountModal();
  renderDrawer();
  renderFearGreedWidget();
}

function runRefreshCycle(includeFearGreed = false) {
  const jobs = [
    includeFearGreed ? refreshFearGreed() : Promise.resolve(false),
    refreshCatalystTokenMarkets(),
    refreshLiveTokens().then(() => refreshSeededDexMetrics()),
    refreshLiveNfts(),
  ];
  document.body.classList.add("is-refreshing");
  Promise.allSettled(jobs).finally(() => {
    document.body.classList.remove("is-refreshing");
    updateScoreDeltasFromSnapshot();
    emitOpportunityNotifications();
    render();
  });
}

document.addEventListener("click", (event) => {
  if (event.target.closest("a")) return;
  const closeDetail = event.target.closest("[data-detail-close]");
  const closeAccount = event.target.closest("[data-account-close]");
  const openAuth = event.target.closest("#authButton,[data-open-login]");
  const connectWallet = event.target.closest("[data-wallet-connect]");
  const chooseAvatar = event.target.closest("[data-avatar-choice]");
  const logoutProfile = event.target.closest("[data-profile-logout]");
  const watch = event.target.closest("[data-watch-id]");
  const mapPoint = event.target.closest("[data-map-id]");
  const nav = event.target.closest("[data-module]");
  const searchResult = event.target.closest("[data-search-result]");
  const copyContract = event.target.closest("[data-copy-contract]");
  const filterToggle = event.target.closest("[data-filter-toggle]");
  const filterClear = event.target.closest("[data-filter-clear]");
  const sortToggle = event.target.closest("[data-sort-toggle]");
  const sortOption = event.target.closest("[data-sort-option]");
  const card = event.target.closest("[data-card-id]");
  const watchlistButton = event.target.closest("#watchlistButton");
  if (closeDetail) {
    state.detailId = "";
    render();
  } else if (closeAccount || event.target.id === "accountOverlay") {
    state.accountModal = "";
    render();
  } else if (openAuth) {
    state.accountModal = isGuestMode() ? "login" : "profile";
    render();
  } else if (connectWallet) {
    connectWalletFlow(connectWallet.dataset.walletConnect)
      .then(() => {
        saveProfile();
        state.accountModal = "profile";
        showCopyToast("Wallet Live");
        refreshPortfolioSnapshot().finally(() => render());
        render();
      })
      .catch((error) => {
        if (/Backend offline|API 404/i.test(String(error?.message || ""))) showCopyToast("Backend Offline");
        else if (/Wallet Missing/i.test(String(error?.message || ""))) showCopyToast("Install Wallet");
        else showCopyToast("Login Failed");
      });
  } else if (chooseAvatar) {
    state.profile.avatar = chooseAvatar.dataset.avatarChoice;
    saveProfile();
    persistProfile();
    render();
  } else if (logoutProfile) {
    apiRequest("/api/auth/logout", { method: "POST" })
      .catch(() => null)
      .finally(() => {
        state.profile = { ...state.profile, isLoggedIn: false, walletKey: "", walletName: "", walletAddress: "" };
        state.savedItems = [];
        state.watchlistMode = false;
        state.accountModal = "";
        saveProfile();
        render();
      });
  } else if (copyContract) {
    event.preventDefault();
    event.stopPropagation();
    navigator.clipboard?.writeText(copyContract.dataset.copyContract || "")
      .then(() => showCopyToast("Copied"))
      .catch(() => showCopyToast("Copy Failed"));
  } else if (searchResult) {
    openAnalyzerResult(searchResult.dataset.searchResult);
    render();
  } else if (watch) {
    if (isGuestMode()) {
      state.accountModal = "login";
      render();
      return;
    }
    toggleWatchlist(watch.dataset.watchId);
    syncWatchlist(isWatched(watch.dataset.watchId) ? "POST" : "DELETE", watch.dataset.watchId);
    render();
  } else if (watchlistButton) {
    if (isGuestMode()) {
      state.accountModal = "login";
      render();
      return;
    }
    state.watchlistMode = !state.watchlistMode;
    state.selectedId = (state.activeModule === "analyzer" ? analyzerItems()[0]?.id : rankedItems()[0]?.id) || state.selectedId;
    state.detailId = "";
    render();
  } else if (mapPoint) {
    const selected = opportunities.find((item) => item.id === mapPoint.dataset.mapId);
    if (selected) {
      state.selectedId = selected.id;
      state.detailId = selected.id;
      render();
    }
  } else if (filterToggle) {
    state.filterMenuOpen = !state.filterMenuOpen;
    state.sortMenuOpen = false;
    render();
  } else if (sortToggle) {
    state.sortMenuOpen = !state.sortMenuOpen;
    state.filterMenuOpen = false;
    render();
  } else if (filterClear) {
    clearFilters();
    state.filterMenuOpen = true;
    render();
  } else if (sortOption) {
    setSortKey(state.activeModule, sortOption.dataset.sortOption);
    state.sortMenuOpen = false;
    state.detailId = "";
    render();
  } else if (nav) {
    state.activeModule = nav.dataset.module;
    state.selectedFilters = {};
    state.watchlistMode = false;
    state.filterMenuOpen = false;
    state.sortMenuOpen = false;
    state.selectedId = (state.activeModule === "analyzer" ? analyzerItems()[0]?.id : rankedItems()[0]?.id) || state.selectedId;
    state.detailId = "";
    render();
  } else if (card) {
    state.selectedId = card.dataset.cardId;
    state.detailId = card.dataset.cardId;
    render();
  } else if (event.target.closest("#refreshButton")) {
    runRefreshCycle(true);
  } else if (!event.target.closest(".filter-cluster")) {
    if (state.filterMenuOpen || state.sortMenuOpen) {
      state.filterMenuOpen = false;
      state.sortMenuOpen = false;
      render();
    }
    if (!event.target.closest("#searchStack") && state.searchOpen) {
      state.searchOpen = false;
      render();
    }
  }
});

document.addEventListener("keydown", (event) => {
  ensureAudioReady();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    qs("tokenSearchInput")?.focus();
  }
  if (event.key === "Enter" && document.activeElement?.id === "tokenSearchInput" && state.searchResults.length) {
    event.preventDefault();
    const first = state.searchResults[0];
    openAnalyzerResult(`${first.chainId}:${first.pairAddress || first.baseToken?.address}`);
    render();
    return;
  }
  if (event.key === "Escape" && state.detailId) {
    state.detailId = "";
    render();
    return;
  }
  if (event.key === "Escape" && state.searchOpen) {
    state.searchOpen = false;
    render();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-filter-group]")) {
    toggleFilterSelection(event.target.dataset.filterGroup, event.target.value);
    state.detailId = "";
    render();
  }
  if (event.target.matches("[data-bias]")) {
    state.bias[event.target.dataset.bias] = Number(event.target.value);
    localStorage.setItem("alphaLeak.bias", JSON.stringify(state.bias));
    render();
  }
  if (event.target.id === "walletWatchlist") {
    state.watchlist = event.target.value;
    localStorage.setItem("alphaLeak.watchlist", state.watchlist);
  }
  if (event.target.id === "profileNameInput") {
    state.profile.displayName = event.target.value || "Guest Operator";
    saveProfile();
    persistProfile();
  }
  if (event.target.id === "tokenSearchInput") {
    clearTimeout(searchDebounce);
    const query = event.target.value;
    searchDebounce = window.setTimeout(() => {
      performTokenSearch(query);
    }, 220);
  }
});

document.addEventListener("focusin", (event) => {
  ensureAudioReady();
  if (event.target.id === "tokenSearchInput" && state.searchQuery.trim().length >= 2) {
    state.searchOpen = true;
    render();
  }
});

document.addEventListener("pointerdown", ensureAudioReady, { passive: true });

primeOpportunityUniverse();
primeNotificationRegistry();
render();
discoverWalletProviders();
hydrateSession();
Promise.allSettled([
  refreshFearGreed(),
  refreshCatalystTokenMarkets(),
  refreshLiveTokens().then(() => refreshSeededDexMetrics()),
  refreshLiveNfts(),
]).then((results) => {
  if (results.some((result) => result.status === "fulfilled" && result.value)) {
    updateScoreDeltasFromSnapshot();
    primeNotificationRegistry();
    render();
  }
});

setInterval(() => {
  runRefreshCycle(false);
}, 60000);

setInterval(() => {
  refreshFearGreed().then((changed) => {
    if (changed) render();
  });
}, 3600000);

// Force Update: v1.0.5 - Surge Noise Reduction Active
