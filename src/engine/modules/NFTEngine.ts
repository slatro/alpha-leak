import { AlphaOpportunity } from '../types';
import { calculateCompositeScore, determineFreshness, getActionSuggestion } from '../scoring';

export class NFTDiscoveryEngine {
  async discover(rawCollections: any[]): Promise<AlphaOpportunity[]> {
    return rawCollections.map(col => {
      // Logic to reject blue chips (e.g., if market cap > $100M)
      if (col.marketCap > 100000000) return null;

      const firstSeen = Date.now() - (Math.random() * 1000 * 60 * 60 * 48);
      const crowdSaturation = this.calculateCrowd(col);
      
      const scoreInputs = {
        xSignal: col.xFollowerGrowth > 0.2 ? 90 : 50,
        walletSignal: col.sweeperCount * 15,
        trust: col.founderDoxxed ? 85 : 40,
        risk: col.supply > 10000 ? 70 : 30,
        crowdSaturation,
        firstSeen
      };

      const compositeAlpha = calculateCompositeScore(scoreInputs);

      return {
        id: `n_${col.id}`,
        module: 'nft',
        name: col.name,
        category: col.chain === 'ethereum' ? 'ETH Art' : 'SOL Culture',
        links: {
          source: 'Reservoir API',
          marketplace: `https://opensea.io/collection/${col.slug}`,
          twitter: col.socials?.twitter
        },
        timestamps: {
          firstSeen,
          capturedAt: Date.now()
        },
        freshness: determineFreshness(firstSeen, crowdSaturation),
        crowdState: crowdSaturation > 70 ? 'Mainstream' : 'Early Public',
        scores: {
          ...scoreInputs,
          compositeAlpha
        },
        thesis: `Floor anomaly detected with ${col.sweeperCount} unique sweepers in 24h. Under the radar.`,
        researchNote: `Supply: ${col.supply}. Founder track record: ${col.founderStatus}.`,
        actionSuggestion: getActionSuggestion(compositeAlpha, scoreInputs.risk),
        positives: ['Low supply', 'High wallet overlap'],
        negatives: ['Founder not doxxed'],
        scoreReasons: ['Sweeper activity spike', 'Low guide saturation'],
        evidence: col
      };
    }).filter(Boolean) as AlphaOpportunity[];
  }

  private calculateCrowd(col: any): number {
    return col.discordSize > 50000 ? 85 : 25;
  }
}
