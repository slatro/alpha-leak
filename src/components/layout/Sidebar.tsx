import { Activity, Coins, Image, Droplet, Newspaper, Wallet, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Decision Center', icon: Activity },
  { id: 'token', label: 'Token Radar', icon: Coins },
  { id: 'nft', label: 'NFT Radar', icon: Image },
  { id: 'airdrop', label: 'Airdrop Radar', icon: Droplet },
  { id: 'narrative', label: 'Narrative Radar', icon: Newspaper },
  { id: 'wallet', label: 'Smart Wallets', icon: Wallet },
];

export function Sidebar({ activeModule, setActiveModule }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-cyber-border bg-black/10 backdrop-blur-3xl flex flex-col z-20">
      <div className="h-16 flex items-center px-6 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-cyber-accent/10 border border-cyber-accent/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-cyber-accent text-glow" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">ALPHA LEAK</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/20 shadow-[0_0_15px_rgba(0,240,255,0.05)]" 
                  : "text-cyber-text-muted hover:text-white hover:bg-cyber-panel border border-transparent"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-cyber-accent text-glow" : "text-cyber-text-muted")} />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-cyber-border">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-cyber-text-muted hover:text-white hover:bg-cyber-panel transition-all w-full">
          <Settings className="w-4 h-4" />
          Private Mode Settings
        </button>
      </div>
    </aside>
  );
}
