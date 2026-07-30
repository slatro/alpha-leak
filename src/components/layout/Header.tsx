import { Bell, Search, ShieldAlert } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b border-cyber-border bg-cyber-surface/30 backdrop-blur-md flex items-center justify-between px-6 z-20">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyber-text-muted" />
          <input 
            type="text" 
            placeholder="Search signals, wallets, or tokens..." 
            className="w-full bg-cyber-panel border border-cyber-border rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-cyber-accent/50 focus:ring-1 focus:ring-cyber-accent/50 transition-all text-cyber-text placeholder:text-cyber-text-muted"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-danger-dim border border-cyber-danger/30 text-cyber-danger text-xs font-medium">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Crowd Filter Active</span>
        </div>
        
        <button className="relative p-2 rounded-full hover:bg-cyber-panel text-cyber-text-muted hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyber-accent rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)]"></span>
        </button>
        
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-accent to-purple-600 flex items-center justify-center border border-cyber-border-highlight cursor-pointer">
          <span className="text-xs font-bold text-white">0x</span>
        </div>
      </div>
    </header>
  );
}
