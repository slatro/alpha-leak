import { X, ExternalLink, ShieldCheck, TrendingUp, History, Wallet, Star } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { getExplorerUrl } from '../../lib/intelligence';
import type { WalletSignal } from '../../lib/intelligence';
import { useEffect } from 'react';

interface Props {
  wallet: WalletSignal | null;
  onClose: () => void;
}

export function WalletModal({ wallet, onClose }: Props) {
  useEffect(() => {
    if (wallet) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [wallet]);

  if (!wallet) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xl cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a0f1a]/80 backdrop-blur-[40px] shadow-2xl flex flex-col z-[110]"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-start justify-between bg-gradient-to-r from-cyber-success/5 to-transparent">
            <div className="flex gap-6">
              <div className="w-20 h-20 rounded-2xl bg-cyber-success/10 border border-cyber-success/30 flex items-center justify-center text-cyber-success font-black text-3xl shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                {wallet.alias[0]}
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <a 
                    href={getExplorerUrl(wallet.address, wallet.chain)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/alias flex items-center gap-3"
                  >
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic group-hover/alias:text-cyber-success transition-colors">{wallet.alias}</h2>
                    <ExternalLink className="w-5 h-5 text-white/20 group-hover/alias:text-cyber-success transition-all" />
                  </a>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-success/10 border border-cyber-success/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyber-success" />
                    <span className="text-[10px] font-black text-cyber-success uppercase tracking-widest">Verified Hunter</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-cyber-text-muted font-mono text-sm opacity-60">{wallet.address}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span className="text-cyber-text-muted text-xs font-bold uppercase tracking-widest italic">{wallet.lastActivity} activity</span>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Side: Performance Metrics */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-cyber-text-muted uppercase tracking-[0.2em]">Total Profit</span>
                  <span className="text-4xl font-black text-cyber-success tracking-tighter">{wallet.totalProfit}</span>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-cyber-text-muted uppercase tracking-[0.2em]">Win Rate</span>
                  <span className="text-4xl font-black text-white tracking-tighter">{wallet.winRate}</span>
                </div>
                
                <GlassCard className="p-6 flex flex-col gap-4 border-cyber-success/20">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyber-success" />
                    Hunter Heuristics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyber-text-muted font-bold uppercase">Avg Entry</span>
                      <span className="text-[10px] text-white font-black">$500 - $2k</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyber-text-muted font-bold uppercase">Holding Time</span>
                      <span className="text-[10px] text-white font-black">2h - 48h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyber-text-muted font-bold uppercase">Risk Profile</span>
                      <span className="text-[10px] text-cyber-success font-black">Surgical</span>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Right Side: Recent Activity */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                    <History className="w-5 h-5 text-cyber-success" />
                    Recent Live Plays
                  </h3>
                  <span className="text-[10px] text-cyber-text-muted font-bold italic opacity-40">Live Blockchain Feed</span>
                </div>

                <div className="flex flex-col gap-4">
                  {wallet.recentPlays.map((play, i) => (
                    <a 
                      key={i}
                      href={play.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-cyber-success/30 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <ExternalLink className="w-5 h-5 text-white/20 group-hover:text-cyber-success transition-colors" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-white uppercase tracking-tight group-hover:text-cyber-success transition-colors">
                              {play.name}
                            </span>
                            <span className="text-[10px] font-bold text-cyber-text-muted">({play.symbol})</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-black text-cyber-success uppercase px-1.5 py-0.5 bg-cyber-success/10 rounded border border-cyber-success/20">
                              {play.type}
                            </span>
                            <span className="text-[9px] text-cyber-text-muted font-bold italic">{play.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right flex flex-col">
                          <span className="text-xs font-black text-cyber-success">BUYING</span>
                          <span className="text-[9px] text-cyber-text-muted font-bold uppercase">Smart Entry</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-cyber-success group-hover:translate-x-1 transition-all" />
                      </div>
                    </a>
                  ))}
                </div>

                {wallet.recentPlays.length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20 border-2 border-dashed border-white/10 rounded-3xl">
                    <Wallet className="w-12 h-12" />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">No recent plays detected</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 bg-cyber-success/5 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyber-success animate-ping" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Currently Scanning On-Chain Movements</span>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
              <Star className="w-4 h-4" />
              Add to Alert List
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
