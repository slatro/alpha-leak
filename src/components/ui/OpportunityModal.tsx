import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Globe, Zap, ShieldAlert, Award, Wallet, Activity, ChevronRight, Info, Star } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ScoreRing } from './ScoreRing';
import { cn } from '../../lib/utils';
import type { Opportunity, TokenOpportunity, NFTOpportunity, AirdropOpportunity } from '../../lib/intelligence';
import { useEffect, useState } from 'react';
import { SmartImage } from './SmartImage';

interface ModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  watchlist: string[];
  onToggleWatchlist: (id: string, e: React.MouseEvent) => void;
}

export function OpportunityModal({ opportunity, onClose, watchlist, onToggleWatchlist }: ModalProps) {
  // Lock body scroll when modal is open
  // Lock body scroll when modal is open
  useEffect(() => {
    if (opportunity) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [opportunity]);

  if (!opportunity) return null;

  const isWatchlisted = watchlist.includes(opportunity.id);
  const isToken = opportunity.module === 'token';
  const tokenOpp = opportunity as TokenOpportunity;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 overflow-hidden">
        {/* Lighter, Hyper-Blur Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-white/[0.02] backdrop-blur-[24px] cursor-pointer"
        />

        {/* 3D Frosted Glass Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/[0.03] backdrop-blur-[60px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col z-[110]"
        >
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50" />
          
          {/* Header - Glassy */}
          <div className="p-10 border-b border-white/10 flex items-start justify-between bg-white/[0.02] relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-cyber-accent/10 border border-cyber-accent/30 flex items-center justify-center text-cyber-accent text-3xl font-black shadow-[0_0_30px_rgba(56,189,248,0.1)] overflow-hidden">
                <SmartImage 
                  src={opportunity.image || ''} 
                  alt={opportunity.name} 
                  className="w-full h-full object-cover"
                  tokenAddress={isToken ? tokenOpp.address : undefined}
                  chain={opportunity.chain}
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">{opportunity.name}</h2>
                  <span className="px-3 py-1 rounded-full bg-cyber-accent/20 border border-cyber-accent/30 text-cyber-accent text-[10px] font-black uppercase tracking-widest">
                    {opportunity.chain}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-cyber-text-muted text-sm font-medium">
                  <code className="opacity-60">{isToken ? tokenOpp.address : 'Contract Stealth'}</code>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-success shadow-[0_0_10px_#10b981]" />
                  <span className="uppercase tracking-widest text-[10px]">Live Data Feed</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/40 hover:text-white transition-all group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Deep Analysis */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                <section className="flex flex-col gap-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyber-accent" />
                    Deep Intelligence Thesis
                  </h3>
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyber-accent/40" />
                    <p className="text-xl leading-relaxed text-white font-medium italic">
                      "{opportunity.thesis}"
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {['Smart Wallet Accumulation', 'Liquidity Surge', 'Low Social Noise', 'Institutional Beta'].map(tag => (
                        <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-white/[0.05] border border-white/10 shadow-xl flex flex-col gap-2 hover:bg-white/[0.08] transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyber-text-muted">Window of Opportunity</span>
                    <span className="text-2xl font-black text-blue-400 italic uppercase tracking-tighter">{opportunity.freshness}</span>
                    <p className="text-[10px] text-cyber-text-muted opacity-60 leading-relaxed">Early-stage discovery phase. Minimal retail awareness detected on X/Discord.</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/[0.05] border border-white/10 shadow-xl flex flex-col gap-2 hover:bg-white/[0.08] transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyber-text-muted">Edge Rating</span>
                    <span className="text-2xl font-black text-cyber-success italic uppercase tracking-tighter">{opportunity.actionSuggestion}</span>
                    <p className="text-[10px] text-cyber-text-muted opacity-60 leading-relaxed">High-conviction entry point identified via on-chain heuristic analysis.</p>
                  </div>
                </section>

                {isToken && (
                  <section className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.05] border border-white/10 shadow-lg flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">FDV</span>
                      <span className="text-lg font-black text-white">{tokenOpp.fdv}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.05] border border-white/10 shadow-lg flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">24h Volume</span>
                      <span className="text-lg font-black text-white">{tokenOpp.volume24h}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.05] border border-white/10 shadow-lg flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Supply</span>
                      <span className={cn("text-lg font-black", tokenOpp.supply === 'Infinite' ? 'text-rose-400' : 'text-cyber-success')}>
                        {tokenOpp.supply}
                      </span>
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column: Metrics & Actions */}
              <div className="flex flex-col gap-8">
                <section className="flex flex-col gap-4">
                   <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Alpha Scores</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center gap-3">
                        <ScoreRing score={opportunity.scores.compositeAlpha} size={60} strokeWidth={6} color="#38bdf8" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Alpha Score</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center gap-3">
                        <ScoreRing score={opportunity.scores.walletSignal} size={60} strokeWidth={6} color="#10b981" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Smart Money</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center gap-3">
                        <ScoreRing score={opportunity.scores.xSignal} size={60} strokeWidth={6} color="#f472b6" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Social Hype</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center gap-3">
                        <ScoreRing score={100 - opportunity.scores.risk} size={60} strokeWidth={6} color="#f87171" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Safety</span>
                      </div>
                   </div>
                </section>

                <div className="mt-auto flex flex-col gap-3">
                  {opportunity.links?.dexscreener && (
                    <a 
                      href={opportunity.links.dexscreener}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-5 bg-white hover:bg-white/90 text-black text-xs font-black uppercase tracking-[0.3em] transition-all rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <TrendingUp className="w-5 h-5" />
                      Open Live Chart
                    </a>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href={opportunity.links?.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Twitter
                    </a>
                    <button 
                      onClick={(e) => onToggleWatchlist(opportunity.id, e)}
                      className={cn(
                        "py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl flex items-center justify-center gap-2 border",
                        isWatchlisted 
                          ? "bg-amber-400/20 border-amber-400/40 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]" 
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      )}
                    >
                      <Star className={cn("w-4 h-4", isWatchlisted && "fill-amber-400")} />
                      {isWatchlisted ? 'In Watchlist' : 'Add Watchlist'}
                    </button>
                    
                    {opportunity.links?.coingecko && (
                      <a 
                        href={opportunity.links.coingecko} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="py-4 bg-[#8cc63f]/10 border border-[#8cc63f]/30 text-[#8cc63f] hover:bg-[#8cc63f]/20 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl flex items-center justify-center gap-2"
                      >
                        Coingecko
                      </a>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Warning - Only for high-volatility modules */}
          {(opportunity.module === 'token' || opportunity.module === 'nft') && (
            <div className="p-4 bg-rose-500/10 border-t border-rose-500/20 flex items-center justify-center gap-3">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">DANGER: High volatility asset. Secure your entry.</span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
