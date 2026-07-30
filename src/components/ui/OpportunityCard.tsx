import { LineChart, ShoppingCart, X, MessageSquare, Globe, Zap, Star, ShieldAlert, Award, TrendingUp } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ScoreRing } from './ScoreRing';
import { cn } from '../../lib/utils';
import type { Opportunity, TokenOpportunity } from '../../lib/intelligence';
import { SmartImage } from './SmartImage';
import { useState } from 'react';

interface Props {
  opportunity: Opportunity;
  onToggleWatchlist: (id: string, e: React.MouseEvent) => void;
  isWatchlisted: boolean;
}

export function OpportunityCard({ opportunity, onToggleWatchlist, isWatchlisted }: Props) {
  const isHighRisk = opportunity.riskLevel === 'high';
  const isMediumRisk = opportunity.riskLevel === 'medium';
  const isToken = opportunity.module === 'token';
  const tokenOpp = isToken ? (opportunity as TokenOpportunity) : null;

  const moduleColors = {
    token: 'hover:!border-sky-400/80',
    nft: 'hover:!border-emerald-400/80',
    airdrop: 'hover:!border-amber-400/80',
    narrative: 'hover:!border-purple-400/80',
    wallet: 'hover:!border-rose-400/80'
  };

  const activeColor = moduleColors[opportunity.module] || 'hover:!border-white/40';

  const glowColors = {
    token: 'group-hover/card:shadow-[0_0_20px_rgba(56,189,248,0.25)]',
    nft: 'group-hover/card:shadow-[0_0_20px_rgba(52,211,153,0.25)]',
    airdrop: 'group-hover/card:shadow-[0_0_20px_rgba(251,191,36,0.25)]',
    narrative: 'group-hover/card:shadow-[0_0_20px_rgba(168,85,247,0.25)]',
    wallet: 'group-hover/card:shadow-[0_0_20px_rgba(244,63,94,0.25)]'
  };

  const activeGlow = glowColors[opportunity.module] || 'group-hover/card:shadow-[0_0_15px_rgba(255,255,255,0.1)]';

  return (
    <GlassCard className={cn(
      "h-[420px] w-full p-5 flex flex-col gap-3 relative group/card glass-panel-hover overflow-hidden bg-black/20 border transition-all duration-500 hover:scale-[1.02] hover:z-20",
      activeColor,
      activeGlow
    )}>
      {/* Shine Effect Overlay */}
      <div className="glass-shine opacity-40" />

      {/* Top Header Section */}
      <div className="flex items-start justify-between relative z-10 shrink-0">
        <div className="flex gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-xl overflow-hidden shrink-0 relative">
            <SmartImage 
              src={opportunity.image || ''} 
              alt={opportunity.name} 
              className="w-full h-full object-cover"
              tokenAddress={isToken ? (opportunity as TokenOpportunity).address : undefined}
              chain={opportunity.chain}
              fallbackText={opportunity.ticker?.[0] || opportunity.name[0]}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-cyber-text-muted font-mono opacity-60 uppercase">{opportunity.firstSeen}</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-none mt-1 truncate">
              {opportunity.ticker || opportunity.name}
            </h3>
            <span className="text-[10px] text-cyber-text-muted font-bold opacity-60 truncate">
              {opportunity.name}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => onToggleWatchlist(opportunity.id, e)}
              className={cn(
                "p-1.5 rounded-lg border transition-all",
                isWatchlisted 
                  ? "bg-amber-400/20 border-amber-400/40 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]" 
                  : "bg-white/5 border-white/10 text-white/20 hover:text-amber-400 hover:border-amber-400/30"
              )}
            >
              <Star className={cn("w-4 h-4", isWatchlisted && "fill-amber-400")} />
            </button>
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white font-black text-sm shadow-lg">
              {opportunity.scores.compositeAlpha}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyber-success animate-pulse shadow-[0_0_8px_rgba(0,255,163,0.5)]" />
          <span className="text-[8px] font-black text-cyber-success uppercase tracking-widest">LIVE SIGNAL</span>
        </div>
        <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
          {opportunity.timestamp}
        </span>
      </div>

      {/* Main Stats Grid */}
      <div className="flex flex-col gap-2 relative z-10 flex-1 overflow-hidden">
        {/* Combined Window & Edge */}
        <div className="rounded-xl bg-white/[0.04] border border-white/10 flex items-center hover:bg-white/[0.06] transition-all overflow-hidden shrink-0">
          <div className="flex-1 flex flex-col items-center py-2.5">
            <span className="text-[9px] text-cyber-text-muted font-black uppercase tracking-widest opacity-60">Window</span>
            <span className="text-[12px] text-blue-400 font-bold">{opportunity.freshness}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex-1 flex flex-col items-center py-2.5">
            <span className="text-[9px] text-cyber-text-muted font-black uppercase tracking-widest opacity-60">Edge</span>
            <span className="text-[12px] text-cyber-success font-bold">{opportunity.actionSuggestion}</span>
          </div>
        </div>

        {/* Market Data Combined */}
        <div className="rounded-xl bg-white/[0.04] border border-white/10 flex items-center hover:bg-white/[0.06] transition-all overflow-hidden shrink-0">
          {isToken ? (
            <>
              <div className="flex-1 flex flex-col items-center py-2.5 relative">
                <span className="text-[9px] text-cyber-text-muted font-black uppercase tracking-widest opacity-60">FDV</span>
                <span className="text-[12px] text-white font-bold">{tokenOpp?.fdv}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex-1 flex flex-col items-center py-2.5">
                <span className="text-[9px] text-cyber-text-muted font-black uppercase tracking-widest opacity-60">24H VOL</span>
                <span className="text-[12px] text-white font-bold">{tokenOpp?.volume24h}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 flex flex-col items-center py-2.5">
                <span className="text-[9px] text-cyber-text-muted font-black uppercase tracking-widest opacity-60">Module</span>
                <span className="text-[12px] text-white font-bold uppercase">{opportunity.module}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex-1 flex flex-col items-center py-2.5">
                <span className="text-[9px] text-cyber-text-muted font-black uppercase tracking-widest opacity-60">Risk</span>
                <span className={cn("text-[12px] font-bold", isHighRisk ? 'text-cyber-danger' : isMediumRisk ? 'text-cyber-warning' : 'text-cyber-success')}>
                  {opportunity.scores.risk}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 h-[64px] flex items-center shrink-0">
           <p className="text-[10px] leading-relaxed text-cyber-text-muted font-medium line-clamp-3 italic w-full">
            "{opportunity.thesis}"
          </p>
        </div>
      </div>

      {/* Footer Metrics & Actions */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10 relative z-10">
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.05] border border-white/5 text-[9px] font-bold">
            <X className="w-3.5 h-3.5 text-cyber-text-muted" /> <span className="text-white">{opportunity.scores.xSignal}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.05] border border-white/5 text-[9px] font-bold">
            <Wallet className="w-3.5 h-3.5 text-cyber-text-muted" /> <span className="text-white">{opportunity.scores.walletSignal}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {opportunity.links?.dexscreener && (
            <a 
              href={opportunity.links.dexscreener} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => e.stopPropagation()}
              className="px-4 py-1.5 rounded-lg bg-cyber-accent/10 border border-cyber-accent/30 text-cyber-accent hover:bg-cyber-accent/20 transition-all shadow-lg hover:shadow-cyber-accent/20 text-[9px] font-black tracking-widest flex items-center gap-2"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              CHART
            </a>
          )}
          {opportunity.links?.marketplace && (
            <a 
              href={opportunity.links.marketplace} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all"
            >
              <LineChart className="w-4 h-4" />
            </a>
          )}
          {opportunity.links?.twitter && (
            <a 
              href={opportunity.links.twitter} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/15 transition-all"
            >
              <X className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function Wallet(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  )
}
