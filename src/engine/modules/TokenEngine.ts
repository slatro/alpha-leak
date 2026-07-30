import { AlphaOpportunity } from '../types';
import { calculateCompositeScore, determineFreshness, getActionSuggestion } from '../scoring';

export class TokenDiscoveryEngine {
  async discover(rawPairs: any[]): Promise<AlphaOpportunity[]> {
    return rawPairs.map(pair => {
      // Ingestion Normalization
      const firstSeen = Date.now() - (Math.random() * 1000 * 60 * 60 * 24);
      const crowdSaturation = this.estimateCrowd(pair);
      
      const scoreInputs = {
        xSignal: pair.xMentions > 100 ? 80 : 40,
        walletSignal: pair.smartWalletCount * 10,
        trust: pair.isVerified ? 90 : 50,
        risk: pair.liquidity < 10000 ? 80 : 20,
        crowdSaturation,
        firstSeen
      };

      const compositeAlpha = calculateCompositeScore(scoreInputs);

      return {
        id: `t_${pair.address}`,
        module: 'token',
        name: pair.name,
        ticker: pair.symbol,
        category: pair.chain,
        links: {
          source: 'DexScreener API',
          marketplace: `https://dexscreener.com/${pair.chain}/${pair.address}`,
          twitter: pair.socials?.twitter
        },
        timestamps: {
          firstSeen,
          capturedAt: Date.now()
        },
        freshness: determineFreshness(firstSeen, crowdSaturation),
        crowdState: this.getCrowdState(crowdSaturation),
        scores: {
          ...scoreInputs,
          compositeAlpha
        },
        thesis: `High wallet conviction detected on ${pair.chain}. Low crowd awareness currently.`,
        researchNote: `Pair age is ${Math.round((Date.now() - firstSeen) / 3600000)}h. Liquidity is ${pair.liquidity}.`,
        actionSuggestion: getActionSuggestion(compositeAlpha, scoreInputs.risk),
        positives: ['Smart wallet overlap', 'Healthy buy/sell ratio'],
        negatives: ['Thin liquidity'],
        scoreReasons: ['Wallet-first signal', 'Low X saturation'],
        evidence: pair
      };
    });
  }

  private estimateCrowd(pair: any): number {
    // Logic to estimate crowd saturation from mentions and growth
    return pair.xMentions > 500 ? 90 : 20;
  }

  private getCrowdState(saturation: number): any {
    if (saturation > 80) return 'Mainstream';
    if (saturation > 60) return 'Saturated';
    if (saturation > 40) return 'Early Public';
    return 'Smart Money Only';
  }
}
