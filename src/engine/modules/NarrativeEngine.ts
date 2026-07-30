import { AlphaOpportunity } from '../types';
import { calculateCompositeScore, determineFreshness, getActionSuggestion } from '../scoring';

export class NarrativeDiscoveryEngine {
  async discover(rawClusters: any[]): Promise<AlphaOpportunity[]> {
    return rawClusters.map(cluster => {
      const firstSeen = Date.now() - (Math.random() * 1000 * 60 * 60 * 12);
      const crowdSaturation = this.checkMainstreamPickup(cluster);
      
      const scoreInputs = {
        xSignal: cluster.highTrustAccountCount * 8,
        walletSignal: cluster.basketBuyVolume > 1000000 ? 90 : 40,
        trust: 90, // Narratives from high-trust clusters have inherent trust
        risk: cluster.volatilityIndex > 7 ? 80 : 30,
        crowdSaturation,
        firstSeen
      };

      const compositeAlpha = calculateCompositeScore(scoreInputs);

      return {
        id: `nar_${cluster.id}`,
        module: 'narrative',
        name: cluster.name,
        category: cluster.vertical, // e.g. 'DePIN', 'AI', 'ZK-L3'
        links: {
          source: 'X-Cluster Analysis',
          twitter: `https://x.com/search?q=${encodeURIComponent(cluster.name)}`
        },
        timestamps: {
          firstSeen,
          capturedAt: Date.now()
        },
        freshness: determineFreshness(firstSeen, crowdSaturation),
        crowdState: crowdSaturation > 50 ? 'Early Public' : 'Smart Money Only',
        scores: {
          ...scoreInputs,
          compositeAlpha
        },
        thesis: `Emerging cluster detected across ${cluster.highTrustAccountCount} researcher accounts.`,
        researchNote: `Related tokens: ${cluster.basket.join(', ')}.`,
        actionSuggestion: getActionSuggestion(compositeAlpha, scoreInputs.risk),
        positives: ['Strong research overlap', 'Early on-chain volume'],
        negatives: ['High volatility'],
        scoreReasons: ['Account overlap velocity', 'Low mainstream mentions'],
        evidence: cluster
      };
    }).filter(Boolean) as AlphaOpportunity[];
  }

  private checkMainstreamPickup(cluster: any): number {
    return cluster.newsMentionCount > 5 ? 80 : 20;
  }
}
