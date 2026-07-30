import type { ReactNode } from 'react';
import { TopNav } from './TopNav';
import { Search, RefreshCw, Settings, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: ReactNode;
  activeModule: string;
  setActiveModule: (module: string) => void;
  isBlurred?: boolean;
  watchlist?: string[];
  onSelectOpportunity?: (opp: any) => void;
}

export function Layout({ children, activeModule, setActiveModule, isBlurred, watchlist = [], onSelectOpportunity }: LayoutProps) {
  return (
    <div className={cn("min-h-screen bg-cyber-bg relative overflow-x-hidden transition-all duration-500", isBlurred && "blur-md brightness-50 scale-[0.98]")}>
      <TopNav 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
        watchlist={watchlist}
        onSelectOpportunity={onSelectOpportunity}
      />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        {children}
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[80rem] h-[80rem] bg-cyber-accent/12 blur-[160px] rounded-full pointer-events-none z-0 opacity-50" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[90rem] h-[90rem] bg-amber-500/10 blur-[180px] rounded-full pointer-events-none z-0 opacity-40" />
      <div className="fixed top-[30%] left-[20%] w-[70rem] h-[70rem] bg-emerald-500/8 blur-[200px] rounded-full pointer-events-none z-0 opacity-30" />
    </div>
  );
}
