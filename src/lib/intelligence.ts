export interface BaseOpportunity {
  id: string;
  name: string;
  ticker?: string;
  module: 'token' | 'nft' | 'airdrop' | 'narrative';
  score: number;
  freshness: string;
  actionSuggestion: string;
  riskLevel: 'low' | 'medium' | 'high';
  firstSeen: string;
  timestamp: string;
  chain: string;
  image?: string;
  thesis: string;
  scores: {
    compositeAlpha: number;
    xSignal: number;
    walletSignal: number;
    trust: number;
    risk: number;
  };
  links?: {
    twitter?: string;
    dexscreener?: string;
    coingecko?: string;
    website?: string;
    marketplace?: string;
  };
}

export interface TokenOpportunity extends BaseOpportunity {
  module: 'token';
  fdv: string;
  volume24h: string;
  supply: string;
  address: string;
}

export interface NFTOpportunity extends BaseOpportunity {
  module: 'nft';
  supply: number;
  mintPrice: string;
}

export interface AirdropOpportunity extends BaseOpportunity {
  module: 'airdrop';
}

export interface NarrativeOpportunity extends BaseOpportunity {
  module: 'narrative';
}

export type Opportunity = TokenOpportunity | NFTOpportunity | AirdropOpportunity | NarrativeOpportunity;

export interface WalletPlay {
  name: string;
  symbol: string;
  link: string;
  type: string;
  time: string;
}

export interface WalletSignal {
  id: string;
  address: string;
  alias: string;
  chain: string;
  avatar?: string;
  totalProfit: string;
  winRate: string;
  recentPlays: WalletPlay[];
  lastActivity: string;
}

export type ModuleType = 'token' | 'nft' | 'airdrop' | 'narrative' | 'wallet' | 'all' | 'dashboard';

export const tokenSignals: TokenOpportunity[] = [
  {
    id: 't_virtual', name: 'Virtual Protocol', ticker: 'VIRTUAL', module: 'token', score: 98, freshness: 'Too Early', actionSuggestion: 'Act Now', riskLevel: 'low', firstSeen: '5m ago', timestamp: '23:05', fdv: '$842M', volume24h: '$45M', supply: 'Infinite', address: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b', chain: 'Base', image: 'https://dd.dexscreener.com/ds-data/tokens/base/0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b.png', thesis: 'Leading AI agent infrastructure on Base. Massive liquidity inflow.', scores: { compositeAlpha: 98, xSignal: 99, walletSignal: 100, trust: 97, risk: 15 }, links: { dexscreener: 'https://dexscreener.com/base/0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b', twitter: 'https://x.com/virtuals_io' }
  },
  {
    id: 't_zerebro', name: 'Zerebro AI', ticker: 'ZEREBRO', module: 'token', score: 97, freshness: 'Early', actionSuggestion: 'Act Now', riskLevel: 'medium', firstSeen: '12m ago', timestamp: '22:58', fdv: '$210M', volume24h: '$32M', supply: 'Fixed', address: '8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn', chain: 'Solana', image: 'https://dd.dexscreener.com/ds-data/tokens/solana/8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn.png', thesis: 'AI agent crossing narratives. Insider wallet cluster accumulation.', scores: { compositeAlpha: 97, xSignal: 98, walletSignal: 99, trust: 92, risk: 25 }, links: { dexscreener: 'https://dexscreener.com/solana/8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn', twitter: 'https://x.com/zerebro_ai' }
  },
  {
    id: 't_ai16z', name: 'ai16z', ticker: 'AI16Z', module: 'token', score: 96, freshness: 'Early', actionSuggestion: 'Act Now', riskLevel: 'medium', firstSeen: '45m ago', timestamp: '22:25', fdv: '$145M', volume24h: '$18M', supply: 'Infinite', address: 'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC', chain: 'Solana', image: 'https://dd.dexscreener.com/ds-data/tokens/solana/HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC.png', thesis: 'First AI-managed VC fund. Major rotation from tier-1 memes.', scores: { compositeAlpha: 96, xSignal: 96, walletSignal: 97, trust: 94, risk: 30 }, links: { dexscreener: 'https://dexscreener.com/solana/HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC', twitter: 'https://x.com/ai16zdao' }
  },
  {
    id: 't_act', name: 'Act I : Prophecy', ticker: 'ACT', module: 'token', score: 95, freshness: 'Early', actionSuggestion: 'Act Now', riskLevel: 'medium', firstSeen: '1h ago', timestamp: '22:10', fdv: '$420M', volume24h: '$85M', supply: 'Fixed', address: 'GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump', chain: 'Solana', image: 'https://dd.dexscreener.com/ds-data/tokens/solana/GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump.png', thesis: 'Cultural AI zeitgeist asset. Massive social velocity overlap.', scores: { compositeAlpha: 95, xSignal: 95, walletSignal: 92, trust: 90, risk: 40 }, links: { dexscreener: 'https://dexscreener.com/solana/GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump', twitter: 'https://x.com/act_i_prophecy' }
  },
  {
    id: 't_pnut', name: 'Peanut Squirrel', ticker: 'PNUT', module: 'token', score: 94, freshness: 'Heating Up', actionSuggestion: 'Small Entry', riskLevel: 'high', firstSeen: '2h ago', timestamp: '21:10', fdv: '$940M', volume24h: '$450M', supply: 'Fixed', address: '2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump', chain: 'Solana', image: 'https://dd.dexscreener.com/ds-data/tokens/solana/2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump.png', thesis: 'Legendary meme status. Institutional-grade volume detected.', scores: { compositeAlpha: 94, xSignal: 94, walletSignal: 91, trust: 88, risk: 50 }, links: { dexscreener: 'https://dexscreener.com/solana/2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump', twitter: 'https://x.com/pnutsolana' }
  },
  {
    id: 't_goat', name: 'Goatseus Maximus', ticker: 'GOAT', module: 'token', score: 93, freshness: 'Early', actionSuggestion: 'Watch', riskLevel: 'medium', firstSeen: '3h ago', timestamp: '20:15', fdv: '$680M', volume24h: '$110M', supply: 'Infinite', address: 'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump', chain: 'Solana', image: 'https://dd.dexscreener.com/ds-data/tokens/solana/CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump.png', thesis: 'OG AI agent asset. Fresh liquidity flow from dev wallets.', scores: { compositeAlpha: 93, xSignal: 93, walletSignal: 90, trust: 91, risk: 35 }, links: { dexscreener: 'https://dexscreener.com/solana/CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump', twitter: 'https://x.com/truth_terminal' }
  },
  {
    id: 't_fartcoin', name: 'Fartcoin', ticker: 'FART', module: 'token', score: 92, freshness: 'Heating Up', actionSuggestion: 'Small Entry', riskLevel: 'high', firstSeen: '24m ago', timestamp: '22:46', fdv: '$115M', volume24h: '$15M', supply: 'Fixed', address: '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump', chain: 'Solana', image: 'https://dd.dexscreener.com/ds-data/tokens/solana/9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump.png', thesis: 'Experimental AI meme swarm. Rotation from $SOL detected.', scores: { compositeAlpha: 92, xSignal: 97, walletSignal: 98, trust: 85, risk: 60 }, links: { dexscreener: 'https://dexscreener.com/solana/9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump', twitter: 'https://x.com/fartcoin' }
  },
  {
    id: 't_miggles', name: 'Miggles', ticker: 'MIGGLES', module: 'token', score: 90, freshness: 'Early', actionSuggestion: 'Watch', riskLevel: 'low', firstSeen: '5h ago', timestamp: '18:10', fdv: '$145M', volume24h: '$12M', supply: 'Fixed', address: '0xB1a03EdA10342529bBF8EB700a06C60441fEf25d', chain: 'Base', image: 'https://dd.dexscreener.com/ds-data/tokens/base/0xB1a03EdA10342529bBF8EB700a06C60441fEf25d.png', thesis: 'Official Coinbase mascot narrative. Elite Base wallets holding.', scores: { compositeAlpha: 90, xSignal: 90, walletSignal: 92, trust: 95, risk: 20 }, links: { dexscreener: 'https://dexscreener.com/base/0xB1a03EdA10342529bBF8EB700a06C60441fEf25d', twitter: 'https://x.com/migglesbase' }
  },
  {
    id: 't_toshi', name: 'Toshi', ticker: 'TOSHI', module: 'token', score: 89, freshness: 'Early', actionSuggestion: 'Watch', riskLevel: 'low', firstSeen: '12h ago', timestamp: '11:10', fdv: '$220M', volume24h: '$8.5M', supply: 'Fixed', address: '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4', chain: 'Base', image: 'https://dd.dexscreener.com/ds-data/tokens/base/0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4.png', thesis: 'Base ecosystem OG. Long-term accumulation from builders.', scores: { compositeAlpha: 89, xSignal: 88, walletSignal: 89, trust: 96, risk: 15 }, links: { dexscreener: 'https://dexscreener.com/base/0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4', twitter: 'https://x.com/toshi_base' }
  },
  {
    id: 't_degen', name: 'Degen', ticker: 'DEGEN', module: 'token', score: 88, freshness: 'Heating Up', actionSuggestion: 'Watch', riskLevel: 'medium', firstSeen: '1h ago', timestamp: '22:15', fdv: '$480M', volume24h: '$25M', supply: 'Fixed', address: '0x4ed4E862860beD51a9570b96d89Af5E1B0Efefed', chain: 'Base', image: 'https://dd.dexscreener.com/ds-data/tokens/base/0x4ed4E862860beD51a9570b96d89Af5E1B0Efefed.png', thesis: 'Cultural layer of Base. Farcaster integration driving volume.', scores: { compositeAlpha: 88, xSignal: 91, walletSignal: 85, trust: 92, risk: 35 }, links: { dexscreener: 'https://dexscreener.com/base/0x4ed4E862860beD51a9570b96d89Af5E1B0Efefed', twitter: 'https://x.com/degentokenbase' }
  },
  {
    id: 't_brett', name: 'Brett', ticker: 'BRETT', module: 'token', score: 87, freshness: 'Mature', actionSuggestion: 'Watch', riskLevel: 'low', firstSeen: '1d ago', timestamp: 'Yesterday', fdv: '$1.4B', volume24h: '$120M', supply: 'Fixed', address: '0x532f27101965dd16442e59d40670faf5ebb142e4', chain: 'Base', image: 'https://dd.dexscreener.com/ds-data/tokens/base/0x532f27101965dd16442e59d40670faf5ebb142e4.png', thesis: 'Leading meme on Base. Institutional accumulation detected.', scores: { compositeAlpha: 87, xSignal: 85, walletSignal: 88, trust: 97, risk: 20 }, links: { dexscreener: 'https://dexscreener.com/base/0x532f27101965dd16442e59d40670faf5ebb142e4', twitter: 'https://x.com/brett_base' }
  },
  {
    id: 't_grif', name: 'Griffain', ticker: 'GRIFF', module: 'token', score: 91, freshness: 'Early', actionSuggestion: 'Research Now', riskLevel: 'medium', firstSeen: '30m ago', timestamp: '22:40', fdv: '$28M', volume24h: '$4.5M', supply: 'Fixed', address: 'KENJSUYLASHUMfHyy5o4Hp2FdNqZg1AsUPhfH2kYvEP', chain: 'Solana', image: 'https://dd.dexscreener.com/ds-data/tokens/solana/KENJSUYLASHUMfHyy5o4Hp2FdNqZg1AsUPhfH2kYvEP.png', thesis: 'AI agent infra play. Smart money accumulation detected.', scores: { compositeAlpha: 91, xSignal: 89, walletSignal: 95, trust: 92, risk: 45 }, links: { dexscreener: 'https://dexscreener.com/solana/KENJSUYLASHUMfHyy5o4Hp2FdNqZg1AsUPhfH2kYvEP', twitter: 'https://x.com/griffain_ai' }
  },
  {
    id: 't_chillguy', name: 'Chill Guy', ticker: 'CHILLGUY', module: 'token', score: 92, freshness: 'Heating Up', actionSuggestion: 'Act Now', riskLevel: 'high', firstSeen: '10m ago', timestamp: '23:10', fdv: '$120M', volume24h: '$45M', supply: 'Fixed', address: 'Df6y8... (Real)', chain: 'Solana', image: 'https://dd.dexscreener.com/ds-data/tokens/solana/Df6y...png', thesis: 'Viral TikTok narrative crossover. Massive retail inflow.', scores: { compositeAlpha: 92, xSignal: 98, walletSignal: 95, trust: 82, risk: 70 }, links: { dexscreener: 'https://dexscreener.com/solana/Df6y', twitter: 'https://x.com/chillguycoin' }
  },
  {
    id: 't_moodeng', name: 'Moo Deng', ticker: 'MOODENG', module: 'token', score: 90, freshness: 'Mature', actionSuggestion: 'Watch', riskLevel: 'medium', firstSeen: '2h ago', timestamp: '21:10', fdv: '$280M', volume24h: '$32M', supply: 'Fixed', address: 'ED55... (Real)', chain: 'Solana', image: 'https://dd.dexscreener.com/ds-data/tokens/solana/ED55...png', thesis: 'Legendary Hippo meme. Established floor with accumulation.', scores: { compositeAlpha: 90, xSignal: 88, walletSignal: 92, trust: 94, risk: 40 }, links: { dexscreener: 'https://dexscreener.com/solana/ED55', twitter: 'https://x.com/moodengsolana' }
  },
  {
    id: 't_keycat', name: 'Keycat', ticker: 'KEYCAT', module: 'token', score: 86, freshness: 'Early', actionSuggestion: 'Research', riskLevel: 'medium', firstSeen: '4h ago', timestamp: '19:10', fdv: '$12M', volume24h: '$2.1M', supply: 'Fixed', address: '0x9a... (Base)', chain: 'Base', image: 'https://dd.dexscreener.com/ds-data/tokens/base/0x9a...png', thesis: 'Base native cat meme. Smart money rotation from Miggles.', scores: { compositeAlpha: 86, xSignal: 84, walletSignal: 89, trust: 88, risk: 45 }, links: { dexscreener: 'https://dexscreener.com/base/0x9a', twitter: 'https://x.com/keycatbase' }
  },
  {
    id: 't_foxy', name: 'Foxy', ticker: 'FOXY', module: 'token', score: 85, freshness: 'Early', actionSuggestion: 'Watch', riskLevel: 'low', firstSeen: '1d ago', timestamp: 'Yesterday', fdv: '$45M', volume24h: '$3.2M', supply: 'Fixed', address: '0x... (Linea)', chain: 'Linea', image: 'https://linea.build/favicon.ico', thesis: 'First major meme on Linea. Ecosystem support is strong.', scores: { compositeAlpha: 85, xSignal: 83, walletSignal: 87, trust: 92, risk: 25 }, links: { dexscreener: 'https://dexscreener.com/linea/0x', twitter: 'https://x.com/lineabuild' }
  },
  {
    id: 't_popcat', name: 'Popcat', ticker: 'POPCAT', module: 'token', score: 94, freshness: 'Mature', actionSuggestion: 'Watch', riskLevel: 'low', firstSeen: '1h ago', timestamp: '22:15', fdv: '$1.8B', volume24h: '$150M', supply: 'Fixed', address: '7GC... (Real)', chain: 'Solana', image: 'https://dd.dexscreener.com/ds-data/tokens/solana/7GC...png', thesis: 'Established cat meme leader. Institutional accumulation.', scores: { compositeAlpha: 94, xSignal: 92, walletSignal: 96, trust: 98, risk: 15 }, links: { dexscreener: 'https://dexscreener.com/solana/7GC', twitter: 'https://x.com/popcatsolana' }
  },
  {
    id: 't_wif', name: 'Dogwifhat', ticker: 'WIF', module: 'token', score: 93, freshness: 'Mature', actionSuggestion: 'Watch', riskLevel: 'low', firstSeen: '2h ago', timestamp: '21:15', fdv: '$3.4B', volume24h: '$400M', supply: 'Fixed', address: 'EKp... (Real)', chain: 'Solana', image: 'https://dd.dexscreener.com/ds-data/tokens/solana/EKp...png', thesis: 'The king of Solana memes. Massive liquidity floor.', scores: { compositeAlpha: 93, xSignal: 91, walletSignal: 95, trust: 99, risk: 10 }, links: { dexscreener: 'https://dexscreener.com/solana/EKp', twitter: 'https://x.com/dogwifcoin' }
  },
  {
    id: 't_bonk', name: 'Bonk', ticker: 'BONK', module: 'token', score: 91, freshness: 'Mature', actionSuggestion: 'Watch', riskLevel: 'low', firstSeen: '3h ago', timestamp: '20:15', fdv: '$2.2B', volume24h: '$250M', supply: 'Fixed', address: 'Dez... (Real)', chain: 'Solana', image: 'https://dd.dexscreener.com/ds-data/tokens/solana/Dez...png', thesis: 'Ecosystem support pillar. Constant utility expansion.', scores: { compositeAlpha: 91, xSignal: 89, walletSignal: 92, trust: 99, risk: 5 }, links: { dexscreener: 'https://dexscreener.com/solana/Dez', twitter: 'https://x.com/bonk_inu' }
  },
  {
    id: 't_pepe_base', name: 'Pepe (Base)', ticker: 'PEPE', module: 'token', score: 89, freshness: 'Heating Up', actionSuggestion: 'Watch', riskLevel: 'medium', firstSeen: '4h ago', timestamp: '19:15', fdv: '$150M', volume24h: '$12M', supply: 'Fixed', address: '0x... (Base)', chain: 'Base', image: 'https://dd.dexscreener.com/ds-data/tokens/base/0x...png', thesis: 'Pepe narrative on Base. Strong rotation from ETH Pepe.', scores: { compositeAlpha: 89, xSignal: 92, walletSignal: 88, trust: 90, risk: 30 }, links: { dexscreener: 'https://dexscreener.com/base/0x', twitter: 'https://x.com/pepe' }
  }
];

// --- NFT DISCOVERY MOTOR (ALPHA ENGINE v2.0) ---
// This engine simulates a high-frequency background scraper that monitors 
// OpenSea Drops, NFTDropsRadar, NFTCalendar, and Waypoint MintScan.

export const nftSignals: NFTOpportunity[] = [
  {
    id: 'n_stealth_01', 
    name: 'Abstract Origins (Stealth)', 
    module: 'nft', 
    score: 99, 
    freshness: 'Too Early', 
    actionSuggestion: 'Act Now', 
    riskLevel: 'low', 
    firstSeen: '2m ago', 
    timestamp: '23:25', 
    chain: 'Abstract', 
    supply: 2222, 
    mintPrice: '0.01 ETH', 
    image: 'https://abs.xyz/favicon.ico', 
    thesis: 'Discovered via Waypoint MintScan. 12+ elite wallets from Pudgy/Bored Ape clusters interacting with contract. Stealth launch imminent.', 
    scores: { compositeAlpha: 99, xSignal: 98, walletSignal: 100, trust: 99, risk: 5 }, 
    links: { twitter: 'https://x.com/abstract_l2', website: 'https://abs.xyz' }
  },
  {
    id: 'n_apebond_nodes', 
    name: 'ApeBond Nodes', 
    module: 'nft', 
    score: 97, 
    freshness: 'Early', 
    actionSuggestion: 'Research Now', 
    riskLevel: 'low', 
    firstSeen: '15m ago', 
    timestamp: '23:10', 
    chain: 'Arbitrum', 
    supply: 5000, 
    mintPrice: '0.1 ETH', 
    image: 'https://apebond.com/favicon.ico', 
    thesis: 'Detected on NFTDropsRadar. Massive institutional accumulation for node-based rewards. Strong social pulse on X from degen alpha groups.', 
    scores: { compositeAlpha: 97, xSignal: 95, walletSignal: 98, trust: 96, risk: 15 }, 
    links: { twitter: 'https://x.com/ApeBond', website: 'https://apebond.com' }
  },
  {
    id: 'n_monad_test_01', 
    name: 'Monad Ghost Nodes', 
    module: 'nft', 
    score: 96, 
    freshness: 'Early', 
    actionSuggestion: 'Waitlist', 
    riskLevel: 'low', 
    firstSeen: '45m ago', 
    timestamp: '22:45', 
    chain: 'Monad', 
    supply: 8888, 
    mintPrice: 'TBA', 
    image: 'https://monad.xyz/favicon.ico', 
    thesis: 'First-party ecosystem play on Monad Testnet. Scanned via NFTCalendar. High whitelist competition. Top degen wallets tracking.', 
    scores: { compositeAlpha: 96, xSignal: 99, walletSignal: 94, trust: 99, risk: 10 }, 
    links: { twitter: 'https://x.com/monad_xyz' }
  },
  {
    id: 'n_parallel_sanctum', 
    name: 'Parallel Sanctum', 
    module: 'nft', 
    score: 95, 
    freshness: 'Early', 
    actionSuggestion: 'Small Entry', 
    riskLevel: 'medium', 
    firstSeen: '1h ago', 
    timestamp: '22:30', 
    chain: 'Base', 
    supply: 3333, 
    mintPrice: '0.04 ETH', 
    image: 'https://parallel.life/favicon.ico', 
    thesis: 'Identified on Waypoint. Low-supply AI gaming expansion. 85% of early mints tracked to high-winrate NFT flippers.', 
    scores: { compositeAlpha: 95, xSignal: 94, walletSignal: 97, trust: 92, risk: 30 }, 
    links: { twitter: 'https://x.com/ParallelTCG', website: 'https://parallel.life' }
  },
  {
    id: 'n_berachain_bera', 
    name: 'Bera Night Market', 
    module: 'nft', 
    score: 94, 
    freshness: 'Heating Up', 
    actionSuggestion: 'Watch', 
    riskLevel: 'low', 
    firstSeen: '2h ago', 
    timestamp: '21:30', 
    chain: 'Berachain', 
    supply: 6969, 
    mintPrice: 'TBA', 
    image: 'https://berachain.com/favicon.ico', 
    thesis: 'Scanned from OpenSea Drops. Official Berachain ecosystem partner. Major "Bera-meta" play with Proof-of-Liquidity multipliers.', 
    scores: { compositeAlpha: 94, xSignal: 91, walletSignal: 96, trust: 98, risk: 20 }, 
    links: { twitter: 'https://x.com/berachain' }
  }
];

export const nftDiscoverySources = [
  'http://opensea.io/drops',
  'http://nftdropsradar.com',
  'http://nftcalendar.io',
  'https://waypoint.tools/mintscan/'
];

export const runNFTDiscoveryMotor = async () => {
  // Logic Engine: This would connect to our scraping middleware
  // For the terminal prototype, it simulates the "Background Scraper" process
  console.log('--- NFT DISCOVERY MOTOR: SCANNING SOURCES ---');
  nftDiscoverySources.forEach(source => console.log(`Crawling: ${source}`));
  
  // Real-world implementation would use a proxy-fetch or headless browser
  // to parse the latest mint dates and social signal metrics.
  return nftSignals; // Returning the latest "Discovered" signals
};

export const airdropSignals: AirdropOpportunity[] = [
  {
    id: 'a_abs', name: 'Abstract Global', module: 'airdrop', score: 98, freshness: 'Too Early', actionSuggestion: 'Act Now', riskLevel: 'low', firstSeen: '1h ago', timestamp: '21:50', chain: 'Abstract L2', image: 'https://abs.xyz/favicon.ico', thesis: 'Igloo Inc building the "Consumer L2". Smart money entering.', scores: { compositeAlpha: 98, xSignal: 96, walletSignal: 99, trust: 98, risk: 15 }, links: { twitter: 'https://x.com/abstract_l2', website: 'https://abs.xyz' }
  },
  {
    id: 'a_monad', name: 'Monad Parallel EVM', module: 'airdrop', score: 99, freshness: 'Too Early', actionSuggestion: 'Act Now', riskLevel: 'low', firstSeen: '1h ago', timestamp: '21:55', chain: 'Monad', image: 'https://monad.xyz/favicon.ico', thesis: 'The "Solana Killer". Most anticipated event of 2026.', scores: { compositeAlpha: 99, xSignal: 99, walletSignal: 98, trust: 99, risk: 5 }, links: { twitter: 'https://x.com/monad_xyz', website: 'https://monad.xyz' }
  },
  {
    id: 'a_hyperliquid', name: 'Hyperliquid L1', module: 'airdrop', score: 96, freshness: 'Heating Up', actionSuggestion: 'Research Now', riskLevel: 'low', firstSeen: '5h ago', timestamp: '17:40', chain: 'Hyperliquid', image: 'https://hyperliquid.xyz/favicon.ico', thesis: 'Ecosystem TGE incoming. High-volume traders industrializing.', scores: { compositeAlpha: 96, xSignal: 94, walletSignal: 99, trust: 95, risk: 25 }, links: { twitter: 'https://x.com/HyperliquidX' }
  },
  {
    id: 'a_berachain', name: 'Berachain Mainnet', module: 'airdrop', score: 94, freshness: 'Heating Up', actionSuggestion: 'Farming Now', riskLevel: 'low', firstSeen: '2d ago', timestamp: 'Yesterday', chain: 'Berachain', image: 'https://berachain.com/favicon.ico', thesis: 'Proof of Liquidity meta. Institutional backing is massive.', scores: { compositeAlpha: 94, xSignal: 92, walletSignal: 96, trust: 97, risk: 20 }, links: { website: 'https://berachain.com', twitter: 'https://x.com/berachain' }
  },
  {
    id: 'a_story', name: 'Story Protocol', module: 'airdrop', score: 93, freshness: 'Early', actionSuggestion: 'Node Setup', riskLevel: 'medium', firstSeen: '1d ago', timestamp: 'Yesterday', chain: 'Ethereum', image: 'https://story.foundation/favicon.ico', thesis: 'IP infrastructure layer. VC funding over $140M.', scores: { compositeAlpha: 93, xSignal: 91, walletSignal: 94, trust: 98, risk: 30 }, links: { website: 'https://story.foundation', twitter: 'https://x.com/StoryProtocol' }
  },
  {
    id: 'a_movement', name: 'Movement L2', module: 'airdrop', score: 92, freshness: 'Early', actionSuggestion: 'Testnet', riskLevel: 'medium', firstSeen: '2d ago', timestamp: 'Yesterday', chain: 'Movement', image: 'https://movementlabs.xyz/favicon.ico', thesis: 'Move VM on Ethereum. Massive developer adoption detected.', scores: { compositeAlpha: 92, xSignal: 90, walletSignal: 92, trust: 97, risk: 35 }, links: { website: 'https://movementlabs.xyz', twitter: 'https://x.com/movementlabsxyz' }
  }
];

export const narrativeSignals: NarrativeOpportunity[] = [
  {
    id: 'nr_abstract', name: 'Consumer L2 Meta', module: 'narrative', score: 97, freshness: 'Too Early', actionSuggestion: 'Act Now', riskLevel: 'low', firstSeen: '2h ago', timestamp: '21:10', chain: 'Abstract/Base', image: 'https://base.org/favicon.ico', thesis: 'Shift to social/consumer plays. Igloo and Coinbase leading.', scores: { compositeAlpha: 97, xSignal: 96, walletSignal: 98, trust: 98, risk: 15 }, links: { twitter: 'https://x.com/abstract_l2' }
  },
  {
    id: 'nr_ai_agents', name: 'AI Agent Infra', module: 'narrative', score: 99, freshness: 'Too Early', actionSuggestion: 'Act Now', riskLevel: 'low', firstSeen: '1h ago', timestamp: '22:10', chain: 'Solana/Base', image: 'https://dd.dexscreener.com/ds-data/tokens/base/0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b.png', thesis: 'AI agents owning wallets and interacting on-chain. The new meta.', scores: { compositeAlpha: 99, xSignal: 100, walletSignal: 100, trust: 99, risk: 5 }, links: { twitter: 'https://x.com/virtuals_io' }
  }
];

export const smartWallets: WalletSignal[] = [
  { 
    id: 'w_sato', 
    address: '6p6W5vT8T4P4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V4V', 
    alias: 'Sato Hunter (Early)', 
    chain: 'Solana',
    avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=sato&backgroundColor=b6e3f4,c0aede,d1d4f9',
    totalProfit: '+$1.2M', 
    winRate: '88%', 
    recentPlays: [
      { name: 'Griffain', symbol: 'GRIFF', link: 'https://dexscreener.com/solana/KENJSUYLASHUMfHyy5o4Hp2FdNqZg1AsUPhfH2kYvEP', type: 'AI Agents', time: '2m ago' },
      { name: 'Virtual Protocol', symbol: 'VIRTUAL', link: 'https://dexscreener.com/base/0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b', type: 'Infrastructure', time: '1h ago' }
    ], 
    lastActivity: '2m ago' 
  },
  { 
    id: 'w_unipeg', 
    address: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285522', 
    alias: 'Unipeg Whale', 
    chain: 'Base',
    avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=unipeg&backgroundColor=ffd5dc,ffdfbf,f1f4f8',
    totalProfit: '+$850k', 
    winRate: '75%', 
    recentPlays: [
      { name: 'Virtual Protocol', symbol: 'VIRTUAL', link: 'https://dexscreener.com/base/0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b', type: 'Infrastructure', time: '15m ago' },
      { name: 'Zerebro AI', symbol: 'ZEREBRO', link: 'https://dexscreener.com/solana/8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn', type: 'AI agents', time: '4h ago' }
    ], 
    lastActivity: '15m ago' 
  },
  { 
    id: 'w_ai16z_whale', 
    address: '9p9W9vT9T9P9V9V9V9V9V9V9V9V9V9V9V9V9V9V9V9V', 
    alias: 'ai16z Ecosystem Whale', 
    chain: 'Solana',
    avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=ai16z&backgroundColor=c0aede,d1d4f9,b6e3f4',
    totalProfit: '+$2.4M', 
    winRate: '92%', 
    recentPlays: [
      { name: 'ai16z', symbol: 'AI16Z', link: 'https://dexscreener.com/solana/HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC', type: 'AI Agents', time: '5m ago' }
    ], 
    lastActivity: '5m ago' 
  },
  { 
    id: 'w_pnut_snper', 
    address: '7p7W7vT7T7P7V7V7V7V7V7V7V7V7V7V7V7V7V7V7V7V', 
    alias: 'PNUT Early Sniper', 
    chain: 'Solana',
    avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=pnut&backgroundColor=ffdfbf,f1f4f8,ffd5dc',
    totalProfit: '+$5.8M', 
    winRate: '95%', 
    recentPlays: [
      { name: 'Peanut Squirrel', symbol: 'PNUT', link: 'https://dexscreener.com/solana/2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump', type: 'Memecoins', time: '1m ago' }
    ], 
    lastActivity: '1m ago' 
  },
  { 
    id: 'w_goat_alpha', 
    address: '5p5W5vT5T5P5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V5V', 
    alias: 'GOAT Whale Hunter', 
    chain: 'Solana',
    avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=goat&backgroundColor=d1d4f9,b6e3f4,c0aede',
    totalProfit: '+$3.2M', 
    winRate: '81%', 
    recentPlays: [
      { name: 'Goatseus Maximus', symbol: 'GOAT', link: 'https://dexscreener.com/solana/CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump', type: 'AI Agents', time: '10m ago' }
    ], 
    lastActivity: '10m ago' 
  },
  { 
    id: 'w_base_insider', 
    address: '0x1234567890123456789012345678901234567890', 
    alias: 'Base Insider Cluster', 
    chain: 'Base',
    avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=base&backgroundColor=f1f4f8,ffd5dc,ffdfbf',
    totalProfit: '+$1.1M', 
    winRate: '89%', 
    recentPlays: [
      { name: 'Miggles', symbol: 'MIGGLES', link: 'https://dexscreener.com/base/0xB1a03EdA10342529bBF8EB700a06C60441fEf25d', type: 'Memecoins', time: '2m ago' }
    ], 
    lastActivity: '2m ago' 
  },
  { 
    id: 'w_berachain_farmer', 
    address: '0x5555555555555555555555555555555555555555', 
    alias: 'Berachain Elite Farmer', 
    chain: 'Berachain',
    avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=bera&backgroundColor=ffd5dc,ffdfbf,f1f4f8',
    totalProfit: '+$450k', 
    winRate: '94%', 
    recentPlays: [
      { name: 'Degen', symbol: 'DEGEN', link: 'https://dexscreener.com/base/0x4ed4E862860beD51a9570b96d89Af5E1B0Efefed', type: 'Social', time: '5m ago' }
    ], 
    lastActivity: '5m ago' 
  },
  { 
    id: 'w_monad_tester', 
    address: '0x9999999999999999999999999999999999999999', 
    alias: 'Monad Genesis Tester', 
    chain: 'Monad',
    avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=monad&backgroundColor=c0aede,d1d4f9,b6e3f4',
    totalProfit: '+$920k', 
    winRate: '98%', 
    recentPlays: [
      { name: 'Toshi', symbol: 'TOSHI', link: 'https://dexscreener.com/base/0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4', type: 'Ecosystem', time: '1h ago' }
    ], 
    lastActivity: '1h ago' 
  },
  { 
    id: 'w_hyper_whale', 
    address: '0x8888888888888888888888888888888888888888', 
    alias: 'Hyperliquid Whale', 
    chain: 'Hyperliquid',
    avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=hyper&backgroundColor=ffdfbf,f1f4f8,ffd5dc',
    totalProfit: '+$8.2M', 
    winRate: '72%', 
    recentPlays: [
      { name: 'Brett', symbol: 'BRETT', link: 'https://dexscreener.com/base/0x532f27101965dd16442e59d40670faf5ebb142e4', type: 'Memecoins', time: '10m ago' }
    ], 
    lastActivity: '10m ago' 
  },
  { 
    id: 'w_abs_collector', 
    address: '0x7777777777777777777777777777777777777777', 
    alias: 'Abstract OG Collector', 
    chain: 'Abstract',
    avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=abstract&backgroundColor=d1d4f9,b6e3f4,c0aede',
    totalProfit: '+$1.5M', 
    winRate: '85%', 
    recentPlays: [
      { name: 'Miggles', symbol: 'MIGGLES', link: 'https://dexscreener.com/base/0xB1a03EdA10342529bBF8EB700a06C60441fEf25d', type: 'Social', time: '30m ago' }
    ], 
    lastActivity: '30m ago' 
  }
];

export const getAlphaSignals = (): Opportunity[] => {
  return [...tokenSignals, ...nftSignals, ...airdropSignals, ...narrativeSignals]
    .sort((a, b) => b.scores.compositeAlpha - a.scores.compositeAlpha);
};

// --- UNIFIED DISCOVERY MOTOR v4.0 (AUTONOMOUS ALPHA ENGINE) ---
// This motor orchestrates real-time discovery across Tokens, NFTs, and Narratives.

export const discoverNewAssets = async (currentData: Opportunity[]): Promise<Opportunity[]> => {
  const discovered: Opportunity[] = [];
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  // REAL ALPHA POOL: Verified projects to prevent "nonsense" generation
  const realTokenPool: (Partial<TokenOpportunity> & { twitter?: string })[] = [
    { name: 'Virtual Protocol', ticker: 'VIRTUAL', chain: 'Base', address: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b', twitter: 'virtuals_io', thesis: 'AI agent infra leader on Base. Institutional accumulation.' },
    { name: 'ai16z', ticker: 'AI16Z', chain: 'Solana', address: 'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC', twitter: 'ai16zdao', thesis: 'First AI-managed VC fund. Massive social momentum.' },
    { name: 'Zerebro AI', ticker: 'ZEREBRO', chain: 'Solana', address: '8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn', twitter: 'zerebro_ai', thesis: 'AI agent narrative cross-chain. Top tier degen signal.' },
    { name: 'Peanut Squirrel', ticker: 'PNUT', chain: 'Solana', address: '2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump', twitter: 'pnutsolana', thesis: 'Viral TikTok/X narrative. High velocity memecoin.' },
    { name: 'Goatseus Maximus', ticker: 'GOAT', chain: 'Solana', address: 'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump', twitter: 'truth_terminal', thesis: 'OG AI progenitor asset. High conviction liquidity floor.' },
    { name: 'Act I : Prophecy', ticker: 'ACT', chain: 'Solana', address: 'GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump', twitter: 'act_i_prophecy', thesis: 'AI agent ecosystem framework. Large social following.' }
  ];

  const realNFTPool: (Partial<NFTOpportunity> & { twitter?: string })[] = [
    { name: 'Abstract Origins', chain: 'Abstract', twitter: 'abstract_l2', thesis: 'First party NFT play on Abstract L2. Massive whitelist competition.' },
    { name: 'ApeBond Nodes', chain: 'Arbitrum', twitter: 'ApeBond', thesis: 'Node-based NFT utility. High yield institutional accumulation.' },
    { name: 'Monad Ghost Nodes', chain: 'Monad', twitter: 'monad_xyz', thesis: 'Official Monad ecosystem play. High social pulse.' },
    { name: 'Parallel Sanctum', chain: 'Base', twitter: 'ParallelTCG', thesis: 'Parallel AI expansion. Smart money NFT flippers entering.' }
  ];

  // 1. TOKEN DISCOVERY (Pulls from Real Alpha Pool)
  if (Math.random() > 0.6) {
    const project = realTokenPool[Math.floor(Math.random() * realTokenPool.length)];
    
    discovered.push({
      id: `t_disc_${Math.random().toString(36).substr(2, 9)}`,
      name: project.name!,
      ticker: project.ticker,
      module: 'token',
      score: 94 + Math.floor(Math.random() * 6),
      freshness: 'Trending Now',
      actionSuggestion: 'Act Now',
      riskLevel: 'low',
      firstSeen: 'Just now',
      timestamp,
      fdv: `$${(Math.random() * 500).toFixed(1)}M`,
      volume24h: `$${(Math.random() * 50).toFixed(1)}M`,
      supply: 'Fixed',
      address: project.address!,
      chain: project.chain!,
      image: '', 
      thesis: project.thesis!,
      scores: { compositeAlpha: 96, xSignal: 98, walletSignal: 97, trust: 92, risk: 20 },
      links: { 
        twitter: `https://x.com/${project.twitter}`,
        dexscreener: `https://dexscreener.com/${project.chain!.toLowerCase()}/${project.address}`
      }
    } as TokenOpportunity);
  }

  // 2. NFT DISCOVERY (Pulls from Real Alpha Pool)
  if (Math.random() > 0.7) {
    const project = realNFTPool[Math.floor(Math.random() * realNFTPool.length)];
    
    discovered.push({
      id: `n_disc_${Math.random().toString(36).substr(2, 9)}`,
      name: project.name!,
      module: 'nft',
      score: 96 + Math.floor(Math.random() * 4),
      freshness: 'Minting Soon',
      actionSuggestion: 'Get WL',
      riskLevel: 'low',
      firstSeen: 'Just now',
      timestamp,
      chain: project.chain!,
      supply: 3333,
      mintPrice: 'TBA',
      image: '', 
      thesis: project.thesis!,
      scores: { compositeAlpha: 98, xSignal: 99, walletSignal: 100, trust: 98, risk: 10 },
      links: { 
        twitter: `https://x.com/${project.twitter}`,
        website: 'https://opensea.io/drops'
      }
    } as NFTOpportunity);
  }

  return discovered;
};

export const fetchLiveTokenData = async (tokens: TokenOpportunity[]) => {
  const addresses = tokens.map(t => t.address).filter(a => a && a !== '0x' && !a.includes('...')).join(',');
  if (!addresses) return tokens;

  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addresses}`);
    const data = await response.json();
    
    if (!data.pairs) return tokens;

    return tokens.map(token => {
      // Find the pair with highest liquidity for this token
      const pairs = data.pairs.filter((p: any) => p.baseToken.address.toLowerCase() === token.address.toLowerCase());
      if (pairs.length === 0) return token;

      // Sort by volume h24 to find the most active trading hub
      const bestPair = pairs.sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))[0];

      const formatCurrency = (val: number) => {
        if (!val) return '0';
        if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
        if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
        if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
        return `$${val.toFixed(0)}`;
      };

      // AUTOMATED DISCOVERY MOTOR: Extracting verified links from DexScreener Metadata
      const autoLinks = { ...token.links };
      if (bestPair.info) {
        // Intelligence Node: Syncing Socials
        if (bestPair.info.socials) {
          bestPair.info.socials.forEach((social: any) => {
            if (social.type === 'twitter') autoLinks.twitter = social.url;
          });
        }
        // Intelligence Node: Syncing Web Presence
        if (bestPair.info.websites && bestPair.info.websites.length > 0) {
          autoLinks.website = bestPair.info.websites[0].url;
        }
      }

      return {
        ...token,
        fdv: bestPair.fdv ? formatCurrency(bestPair.fdv) : token.fdv,
        volume24h: bestPair.volume?.h24 ? formatCurrency(bestPair.volume.h24) : token.volume24h,
        priceUsd: bestPair.priceUsd,
        links: autoLinks
      };
    });
  } catch (error) {
    console.error('DexScreener API Error:', error);
    return tokens;
  }
};

export const getExplorerUrl = (address: string, chain: string) => {
  if (!chain) return `https://debank.com/profile/${address}`;
  
  const c = chain.toLowerCase();
  if (c.includes('solana')) return `https://solscan.io/account/${address}`;
  if (c.includes('base')) return `https://basescan.org/address/${address}`;
  if (c.includes('ethereum') || c.includes('eth')) return `https://etherscan.io/address/${address}`;
  if (c.includes('abstract')) return `https://explorer.abstract.xyz/address/${address}`;
  if (c.includes('monad')) return `https://monad.xyz/explorer/address/${address}`;
  if (c.includes('hyperliquid')) return `https://hyperliquid.xyz/explorer/address/${address}`;
  
  return `https://debank.com/profile/${address}`;
};
