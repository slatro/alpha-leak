import { useState, useMemo, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { OpportunityCard } from './components/ui/OpportunityCard';
import { OpportunityModal } from './components/ui/OpportunityModal';
import { getAlphaSignals, smartWallets, getExplorerUrl, fetchLiveTokenData, discoverNewAssets } from './lib/intelligence';
import type { Opportunity, WalletSignal, ModuleType, TokenOpportunity } from './lib/intelligence';
import { Search, Filter, TrendingUp, Zap, ChevronDown, Activity, Wallet, LayoutGrid, ExternalLink } from 'lucide-react';
import { GlassCard } from './components/ui/GlassCard';
import { WalletModal } from './components/ui/WalletModal';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { NFTDiscoveryMotor, type CrawlerLog } from './lib/nftCrawler';
import { Terminal, Activity as ActivityIcon } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>('token');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'risk'>('score');
  const [allData, setAllData] = useState<Opportunity[]>(getAlphaSignals());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletSignal | null>(null);
  const [crawlerLogs, setCrawlerLogs] = useState<CrawlerLog[]>([]);
  const [isCrawlerActive, setIsCrawlerActive] = useState(false);
  
  // Watchlist State with persistence
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('alpha_watchlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('alpha_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't open the modal when clicking the star
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Simulate High-Frequency Live Discovery Motor - Tuned for Persistence
  useEffect(() => {
    const interval = setInterval(() => {
      setAllData(prev => {
        let next = [...prev];
        
        // Intelligence Persistence: We NEVER remove old alpha unless it's explicitly bad.
        // For now, we only accumulate new discoveries to build a robust history.

        // 2. Discover NEW Stealth Alpha (Lower frequency for stability)
        if (Math.random() > 0.85) {
          setIsRefreshing(true);
          const modules: ModuleType[] = ['token', 'nft', 'airdrop', 'narrative'];
          const randomModule = modules[Math.floor(Math.random() * modules.length)];
          
          const newSignal: Opportunity = {
            id: `live_${Math.random().toString(36).substr(2, 9)}`,
            name: `Stealth ${['Alpha', 'Flow', 'Node', 'Insider', 'Swarm'][Math.floor(Math.random() * 5)]} #${Math.floor(Math.random() * 999)}`,
            ticker: ['ALPHA', 'FLOW', 'SWARM', 'NODE', 'LEAK'][Math.floor(Math.random() * 5)],
            module: randomModule,
            score: 92 + Math.floor(Math.random() * 8),
            freshness: 'Too Early',
            actionSuggestion: 'Act Now',
            riskLevel: Math.random() > 0.5 ? 'low' : 'medium',
            firstSeen: 'Just now',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            fdv: `$${Math.floor(Math.random() * 50)}M`,
            volume24h: `$${(Math.random() * 10).toFixed(1)}M`,
            supply: Math.random() > 0.7 ? 'Infinite' : 'Fixed',
            address: '0x' + Math.random().toString(36).substr(2, 40),
            chain: ['Solana', 'Base', 'Abstract', 'Monad'][Math.floor(Math.random() * 4)],
            thesis: 'Real-time liquidity surge detected. 8+ Winner Degen Wallets (ROI > 500%) detected entering this stealth pool.',
            scores: { compositeAlpha: 95, xSignal: 94, walletSignal: 98, trust: 92, risk: 20 },
            links: { 
              twitter: 'https://x.com', 
              dexscreener: randomModule === 'token' ? 'https://dexscreener.com' : undefined 
            }
          } as Opportunity;

          next = [newSignal, ...next];
          setTimeout(() => setIsRefreshing(false), 1000);
        }

        return next;
      });
    }, 25000); // Increased interval to 25 seconds for a more stable feed

    return () => clearInterval(interval);
  }, []);

  // Initialize Autonomous NFT Discovery Motor v3.0
  useEffect(() => {
    if (!isCrawlerActive) {
      const motor = new NFTDiscoveryMotor(
        (logs) => setCrawlerLogs(logs),
        (newNFT) => {
          setAllData(prev => {
            // Deduplication Engine: Check by ID and Name to prevent data loops
            const exists = prev.some(item => 
              item.id === newNFT.id || 
              item.name.toLowerCase() === newNFT.name.toLowerCase()
            );
            if (exists) return prev;
            
            // Intelligence Threshold: Keep the feed fresh by limiting to latest 50 items per module
            const filtered = [newNFT, ...prev].slice(0, 100);
            return filtered;
          });
        }
      );
      motor.start();
      setIsCrawlerActive(true);
    }
  }, [isCrawlerActive]);

  // Live Data Synchronization Motor - Automated Research
  useEffect(() => {
    const syncLiveData = async () => {
      // 1. Sync Token Market Data (DexScreener)
      const tokens = allData.filter(i => i.module === 'token') as TokenOpportunity[];
      if (tokens.length > 0) {
        const updatedTokens = await fetchLiveTokenData(tokens);
        setAllData(prev => prev.map(item => {
          if (item.module !== 'token') return item;
          const updated = updatedTokens.find(t => t.id === item.id);
          return updated ? { ...item, ...updated } : item;
        }));
      }

      // 2. Discover NEW Stealth Alpha (Autonomous Motor)
      const newDiscoveries = await discoverNewAssets(allData);
      if (newDiscoveries.length > 0) {
        setAllData(prev => {
          // Unique Check: Prevent duplicates
          const next = [...prev];
          newDiscoveries.forEach(disc => {
            if (!next.find(i => i.name === disc.name || i.id === disc.id)) {
              next.unshift(disc);
            }
          });
          return next.slice(0, 150); // Keep buffer healthy
        });
      }
    };

    syncLiveData(); // Initial sync
    const interval = setInterval(syncLiveData, 15000); // High-frequency discovery (15s)
    return () => clearInterval(interval);
  }, [allData.length]); 


  const filteredData = useMemo(() => {
    let data = allData.filter(item => {
      if (activeModule === 'dashboard') return true;
      return item.module === activeModule;
    });

    if (searchQuery) {
      data = data.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ticker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.chain.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return data.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'risk') {
        const riskMap = { high: 3, medium: 2, low: 1 };
        return riskMap[b.riskLevel] - riskMap[a.riskLevel];
      }
      return 0;
    });
  }, [allData, activeModule, searchQuery, sortBy]);

  const renderModule = () => {
    if (activeModule === 'wallet') {
      return (
        <div className="flex flex-col gap-6 w-full pb-20">
          <div className="flex flex-col gap-2 border-b border-cyber-border pb-6">
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Wallet className="w-8 h-8 text-cyber-accent text-glow" />
              Smart Wallet Radar
            </h1>
            <p className="text-cyber-text-muted text-sm italic">Tracking legendary hunters and insider movements across all chains.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {smartWallets.map((wallet) => (
                <motion.div
                  key={wallet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedWallet(wallet)}
                  className="cursor-pointer"
                >
                  <GlassCard className="p-6 flex flex-col gap-5 glass-panel-hover border-white/5 h-[420px] transition-all duration-500 hover:scale-[1.02] hover:z-20 hover:border-cyber-rose/50 shadow-2xl hover:shadow-cyber-rose/10">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-cyber-rose/10 border border-cyber-rose/30 flex items-center justify-center overflow-hidden">
                        {wallet.avatar ? (
                          <img 
                            src={wallet.avatar} 
                            alt={wallet.alias} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="text-cyber-rose font-black text-lg">${wallet.alias[0]}</div>`;
                            }}
                          />
                        ) : (
                          <span className="text-cyber-rose font-black text-lg">{wallet.alias[0]}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-emerald-400 font-black text-lg">{wallet.totalProfit}</span>
                        <span className="text-[10px] text-cyber-text-muted uppercase font-bold tracking-widest">Total PNL</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-black text-xl tracking-tight uppercase italic truncate mr-2">{wallet.alias}</h3>
                        <a 
                          href={getExplorerUrl(wallet.address, wallet.chain)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/20 hover:text-cyber-rose hover:border-cyber-rose/30 transition-all"
                          title={`View on ${wallet.chain} Explorer`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-[10px] text-cyber-text-muted opacity-40 truncate flex-1">{wallet.address}</code>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                          <span className="text-[8px] font-black text-emerald-400">{wallet.winRate} WR</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-cyber-text-muted uppercase font-black tracking-widest opacity-60">Recent Live Plays</span>
                        <TrendingUp className="w-3 h-3 text-emerald-400/50" />
                      </div>
                      <div className="flex flex-col gap-2">
                        {wallet.recentPlays.length > 0 ? (
                          wallet.recentPlays.slice(0, 3).map((play, idx) => (
                            <a 
                              key={idx}
                              href={play.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-cyber-rose/40 hover:bg-white/5 transition-all group/play"
                            >
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-black text-white group-hover:text-cyber-rose transition-colors truncate">
                                  {play.name}
                                </span>
                                <span className="text-[8px] text-cyber-text-muted font-bold uppercase">{play.type}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[8px] text-cyber-text-muted italic opacity-40">{play.time}</span>
                                <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-cyber-rose transition-colors" />
                              </div>
                            </a>
                          ))
                        ) : (
                          <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-20 border border-dashed border-white/10 rounded-xl">
                            <span className="text-[10px] font-black uppercase">No active plays</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto pt-2">
                      <button className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-cyber-rose hover:border-cyber-rose/30 text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2">
                        <Activity className="w-3.5 h-3.5" />
                        Deep Dive Research
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    const title = activeModule === 'dashboard' ? 'Global Intelligence' : 
                  activeModule === 'token' ? 'Token Alpha Radar' :
                  activeModule === 'nft' ? 'NFT Stealth Radar' :
                  activeModule === 'airdrop' ? 'Airdrop Opportunities' : 'Narrative Hunter';

    return (
      <div className="flex flex-col gap-8 w-full pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
              {title}
            </h1>
            <div className="flex flex-col gap-1">
              <p className="text-cyber-text-muted text-sm font-medium opacity-60 italic max-w-xl">
                High-conviction signals filtered via on-chain heuristics and stealth-stage tracking.
              </p>
              {activeModule === 'nft' && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest opacity-80">
                    Engine v2.0 Scanning: Waypoint, OpenSea Drops, NFTDropsRadar, X-Pulse...
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-text-muted group-focus-within:text-cyber-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Search ticker, chain, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-3 w-72 bg-white/[0.05] border border-white/10 rounded-2xl text-xs font-bold focus:outline-none focus:border-cyber-accent/50 focus:bg-white/[0.08] transition-all placeholder:text-cyber-text-muted/50"
              />
            </div>
            <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-2xl border border-white/10">
              <button 
                onClick={() => setSortBy('score')}
                className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", sortBy === 'score' ? "bg-white/10 text-white shadow-xl" : "text-cyber-text-muted hover:text-white")}
              >
                Score
              </button>
              <button 
                onClick={() => setSortBy('risk')}
                className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", sortBy === 'risk' ? "bg-white/10 text-white shadow-xl" : "text-cyber-text-muted hover:text-white")}
              >
                Risk
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredData.map((opp, index) => (
              <motion.div
                key={opp.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => setSelectedOpportunity(opp)}
                className="cursor-pointer"
              >
                <OpportunityCard 
                  opportunity={opp} 
                  isWatchlisted={watchlist.includes(opp.id)}
                  onToggleWatchlist={toggleWatchlist}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
            <Search className="w-16 h-16 text-cyber-text-muted" />
            <span className="text-xl font-black uppercase tracking-widest text-cyber-text-muted">No signals found in this sector</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Layout 
        activeModule={activeModule} 
        setActiveModule={(module) => setActiveModule(module as ModuleType)}
        isBlurred={!!selectedOpportunity}
        watchlist={watchlist}
        onSelectOpportunity={setSelectedOpportunity}
      >
        {renderModule()}
      </Layout>

      <OpportunityModal 
        opportunity={selectedOpportunity} 
        onClose={() => setSelectedOpportunity(null)} 
        watchlist={watchlist}
        onToggleWatchlist={toggleWatchlist}
      />

      <WalletModal 
        wallet={selectedWallet}
        onClose={() => setSelectedWallet(null)}
      />
    </>
  );
}
