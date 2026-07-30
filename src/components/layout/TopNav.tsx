import { Activity, Coins, Image, Droplet, Newspaper, Wallet, Zap, Star, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { tokenSignals, nftSignals, airdropSignals, narrativeSignals } from '../../lib/intelligence';

interface TopNavProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  watchlist: string[];
  onSelectOpportunity?: (opp: any) => void;
}

const allOpportunities = [...tokenSignals, ...nftSignals, ...airdropSignals, ...narrativeSignals];

const navItems = [
  { id: 'dashboard', label: 'All-in', icon: Zap, color: 'text-white', border: 'border-white/60', glow: 'from-white/20' },
  { id: 'token', label: 'Token Radar', icon: Coins, color: 'text-sky-400', border: 'border-sky-400', glow: 'from-sky-400/20' },
  { id: 'nft', label: 'NFT Radar', icon: Image, color: 'text-emerald-400', border: 'border-emerald-400', glow: 'from-emerald-400/20' },
  { id: 'airdrop', label: 'Airdrop Radar', icon: Droplet, color: 'text-amber-400', border: 'border-amber-400', glow: 'from-amber-400/20' },
  { id: 'narrative', label: 'Narrative Radar', icon: Newspaper, color: 'text-purple-400', border: 'border-purple-400', glow: 'from-purple-400/20' },
  { id: 'wallet', label: 'Smart Wallet', icon: Wallet, color: 'text-rose-400', border: 'border-rose-400', glow: 'from-rose-400/20' },
];

export function TopNav({ activeModule, setActiveModule, watchlist, onSelectOpportunity }: TopNavProps) {
  const [showWatchlist, setShowWatchlist] = useState(false);
  const watchlistedItems = allOpportunities.filter(opp => watchlist.includes(opp.id));

  return (
    <header className="fixed top-0 left-6 right-6 h-20 z-50 px-8 flex items-center justify-between bg-[#080a0f]/60 backdrop-blur-[40px] border-x border-b border-white/10 rounded-b-3xl shadow-[0_15px_40px_rgba(0,0,0,0.5),inset_0_-1px_1px_rgba(255,255,255,0.05)] transition-all duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center rotate-3 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
          <Activity className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tighter text-white italic leading-none uppercase">ALPHA LEAK</span>
          <span className="text-[8px] font-bold text-blue-400 tracking-[0.3em] uppercase opacity-80">v4.2 TERMINAL</span>
        </div>
      </div>

      <nav className="flex items-center gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={cn(
                "relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden border backdrop-blur-2xl min-w-[170px]",
                isActive 
                  ? cn("bg-white/[0.15] shadow-[0_10px_30px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)]", item.border.replace('border-', 'border-2 border-')) 
                  : cn("bg-white/[0.04] border-white/10 hover:bg-white/[0.08] shadow-lg", 
                       item.id === 'token' && "border-sky-500/20 hover:border-sky-500/50",
                       item.id === 'nft' && "border-emerald-500/20 hover:border-emerald-500/50",
                       item.id === 'airdrop' && "border-amber-500/20 hover:border-amber-500/50",
                       item.id === 'narrative' && "border-purple-500/20 hover:border-purple-500/50",
                       item.id === 'wallet' && "border-rose-500/20 hover:border-rose-500/50",
                       item.id === 'dashboard' && "border-white/20 hover:border-white/50"
                    )
              )}
            >
              {/* Vibrant Corner Light Leak */}
              <div className={cn(
                "absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br to-transparent blur-2xl opacity-40 group-hover:opacity-80 transition-opacity pointer-events-none z-0",
                item.glow
              )} />

              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-inner relative z-10",
                isActive ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10",
                item.id === 'token' && "text-sky-400",
                item.id === 'nft' && "text-emerald-400",
                item.id === 'airdrop' && "text-amber-400",
                item.id === 'narrative' && "text-purple-400",
                item.id === 'wallet' && "text-cyber-rose",
                item.id === 'dashboard' && "text-white"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              
              <span className={cn(
                "text-[13px] font-bold tracking-tight transition-colors whitespace-nowrap relative z-10",
                isActive ? "text-white" : "text-cyber-text-muted group-hover:text-white"
              )}>
                {item.label}
              </span>

              {/* Enhanced Glass Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] via-transparent to-white/[0.01] pointer-events-none" />
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-5 relative">
        <button 
          onClick={() => setShowWatchlist(!showWatchlist)}
          className={cn(
            "h-12 px-5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer group relative overflow-hidden min-w-[140px] justify-center",
            showWatchlist 
              ? "bg-amber-400/20 border-amber-400/50 text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.2)]" 
              : "bg-white/5 border-white/10 text-white/60 hover:border-amber-400/50 hover:text-white"
          )}
        >
          <div className="relative">
            <Star className={cn("w-5 h-5", watchlist.length > 0 && "fill-amber-400 text-amber-400")} />
            {watchlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-black text-[9px] font-black shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                {watchlist.length}
              </span>
            )}
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest">Watchlist</span>
        </button>

        <AnimatePresence>
          {showWatchlist && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-16 right-0 w-80 rounded-2xl bg-[#0d1117]/90 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden z-50"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Tracked Alpha</span>
                <span className="text-[9px] font-bold text-amber-400/60 uppercase">{watchlist.length} Items</span>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto py-2 custom-scrollbar">
                {watchlistedItems.length > 0 ? (
                  watchlistedItems.map((opp) => {
                    if (!opp) return null;
                    return (
                      <button
                        key={opp.id}
                      onClick={() => {
                        onSelectOpportunity?.(opp);
                        setShowWatchlist(false);
                      }}
                      className="w-full p-4 hover:bg-white/[0.05] flex items-center gap-4 transition-all group/item border-b border-white/[0.02] last:border-0"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {opp.image ? (
                          <img src={opp.image} alt={opp.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-black">{opp.name[0]}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="text-xs font-black text-white uppercase tracking-tight truncate w-full">{opp.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[8px] font-bold text-cyber-accent uppercase px-1.5 py-0.5 bg-cyber-accent/10 rounded-md border border-cyber-accent/20">{opp.chain}</span>
                          <span className="text-[8px] font-black text-cyber-success uppercase">{opp.scores.compositeAlpha} SCORE</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover/item:text-amber-400 group-hover/item:translate-x-1 transition-all" />
                    </button>
                  );
                })
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-30">
                    <Star className="w-8 h-8" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center px-8">Your intelligence feed is empty. Mark signals to track.</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
