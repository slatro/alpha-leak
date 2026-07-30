import { AlphaOpportunity } from './types';

export const isGenericSpam = (name: string): boolean => {
  const genericTerms = ['PEPE', 'SHIB', 'DOGE', 'INU', 'MOON', 'GENERIC', 'TEST', 'CLAIM', 'AIRDROP_OFFICIAL'];
  return genericTerms.some(term => name.toUpperCase().includes(term));
};

export const filterAlpha = (opportunities: AlphaOpportunity[]): AlphaOpportunity[] => {
  return opportunities.filter(opp => {
    // Aggressive Filters
    if (opp.scores.compositeAlpha < 30) return false;
    if (opp.freshness === 'Too Late') return false;
    if (opp.scores.risk > 90) return false;
    if (isGenericSpam(opp.name)) return false;
    
    return true;
  });
};

export const deduplicate = (opportunities: AlphaOpportunity[]): AlphaOpportunity[] => {
  const seen = new Set<string>();
  const result: AlphaOpportunity[] = [];

  // Sort by score so we keep the highest quality version if duplicates exist
  const sorted = [...opportunities].sort((a, b) => b.scores.compositeAlpha - a.scores.compositeAlpha);

  for (const opp of sorted) {
    const key = `${opp.module}:${opp.ticker || opp.name}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(opp);
    }
  }

  return result;
};
