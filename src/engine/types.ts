export type Freshness = 'Too Early' | 'Early' | 'Heating Up' | 'Crowded' | 'Too Late';
export type CrowdState = 'Ghost Town' | 'Smart Money Only' | 'Early Public' | 'Saturated' | 'Mainstream';
export type ActionSuggestion = 'Act Now' | 'Research Now' | 'Small Entry' | 'Watch' | 'Avoid';
export type AlphaModule = 'token' | 'nft' | 'airdrop' | 'narrative' | 'wallet';

export interface AlphaOpportunity {
  id: string;
  module: AlphaModule;
  name: string;
  ticker?: string;
  category: string;
  
  links: {
    source: string;
    twitter?: string;
    portal?: string;
    marketplace?: string;
    explorer?: string;
  };

  timestamps: {
    firstSeen: number;
    capturedAt: number;
  };

  freshness: Freshness;
  crowdState: CrowdState;
  
  scores: {
    xSignal: number;      // 0-100
    walletSignal: number; // 0-100
    trust: number;        // 0-100
    risk: number;         // 0-100
    compositeAlpha: number; // 0-100
  };

  thesis: string;
  researchNote: string;
  actionSuggestion: ActionSuggestion;
  
  positives: string[];
  negatives: string[];
  scoreReasons: string[];
  
  evidence: Record<string, any>;
}
