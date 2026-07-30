import { AlphaOpportunity, Freshness, CrowdState, ActionSuggestion } from './types';

export interface ScoringInputs {
  xSignal: number;
  walletSignal: number;
  trust: number;
  risk: number;
  crowdSaturation: number; // 0-100 (100 = fully crowded)
  firstSeen: number;
}

export const calculateCompositeScore = (inputs: ScoringInputs): number => {
  // Weights favor wallet movement and trust over crowd hype
  const weights = {
    wallet: 0.35,
    trust: 0.25,
    xSignal: 0.15,
    crowdInversion: 0.25, // Preference for low crowd
  };

  const crowdInversionScore = 100 - inputs.crowdSaturation;
  
  let score = 
    (inputs.walletSignal * weights.wallet) +
    (inputs.trust * weights.trust) +
    (inputs.xSignal * weights.xSignal) +
    (crowdInversionScore * weights.crowdInversion);

  // Penalty for high risk
  if (inputs.risk > 70) score *= 0.8;
  
  return Math.min(100, Math.max(0, Math.round(score)));
};

export const determineFreshness = (firstSeen: number, crowdSaturation: number): Freshness => {
  const ageInHours = (Date.now() - firstSeen) / (1000 * 60 * 60);

  if (crowdSaturation > 80) return 'Too Late';
  if (crowdSaturation > 60) return 'Crowded';
  if (crowdSaturation > 40) return 'Heating Up';
  if (ageInHours < 2) return 'Too Early';
  return 'Early';
};

export const getActionSuggestion = (score: number, risk: number): ActionSuggestion => {
  if (score > 90 && risk < 50) return 'Act Now';
  if (score > 80) return 'Research Now';
  if (score > 60 && risk > 60) return 'Small Entry';
  if (score > 40) return 'Watch';
  return 'Avoid';
};
