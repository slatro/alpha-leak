import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import type { Freshness, ActionSuggestion as Action } from '../../engine/types';

export type SignalLevel = 'high' | 'medium' | 'low';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'outline';
  className?: string;
  glow?: boolean;
}

export function Badge({ children, variant = 'default', className, glow = false }: BadgeProps) {
  const variants = {
    default: 'bg-cyber-panel border border-cyber-border text-cyber-text-muted',
    success: 'bg-cyber-success-dim border border-cyber-success/30 text-cyber-success',
    warning: 'bg-cyber-warning-dim border border-cyber-warning/30 text-cyber-warning',
    danger: 'bg-cyber-danger-dim border border-cyber-danger/30 text-cyber-danger',
    accent: 'bg-cyber-accent-dim border border-cyber-accent/30 text-cyber-accent',
    outline: 'border border-cyber-border-highlight text-cyber-text',
  };

  const glowStyles = {
    default: '',
    success: 'text-glow-success',
    warning: '',
    danger: 'text-glow-danger',
    accent: 'text-glow',
    outline: '',
  };

  return (
    <span
      className={cn(
        'px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider',
        variants[variant],
        glow && glowStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function FreshnessBadge({ freshness }: { freshness: Freshness }) {
  const mapping: Record<Freshness, BadgeProps['variant']> = {
    'Too Early': 'accent',
    'Early': 'success',
    'Heating Up': 'warning',
    'Crowded': 'danger',
    'Too Late': 'danger'
  };

  return <Badge variant={mapping[freshness]} glow>{freshness}</Badge>;
}

export function SignalBadge({ level, label }: { level: SignalLevel, label: string }) {
  const mapping: Record<SignalLevel, BadgeProps['variant']> = {
    high: 'success',
    medium: 'warning',
    low: 'danger'
  };
  
  return <Badge variant={mapping[level]}>{label}</Badge>;
}

export function ActionBadge({ action }: { action: Action }) {
  const mapping: Record<Action, BadgeProps['variant']> = {
    'Act Now': 'success',
    'Research Now': 'warning',
    'Small Entry': 'accent',
    'Watch': 'outline',
    'Avoid': 'danger'
  };

  return (
    <span className={cn(
      "px-3 py-1.5 text-xs font-bold uppercase tracking-widest border rounded-sm",
      action === 'Act Now' ? 'bg-cyber-success/20 border-cyber-success text-cyber-success shadow-[0_0_10px_rgba(0,255,157,0.3)]' :
      action === 'Research Now' ? 'bg-cyber-warning/20 border-cyber-warning text-cyber-warning' :
      action === 'Small Entry' ? 'bg-cyber-accent/20 border-cyber-accent text-cyber-accent' :
      action === 'Avoid' ? 'bg-cyber-danger/20 border-cyber-danger text-cyber-danger' :
      'bg-cyber-panel border-cyber-border text-cyber-text-muted'
    )}>
      {action}
    </span>
  );
}
