import { AlphaOpportunity } from '../types';
import { calculateCompositeScore, determineFreshness, getActionSuggestion } from '../scoring';

export class WalletDiscoveryEngine {
  async discover(rawWallets: any[]): Promise<AlphaOpportunity[]> {
    return rawWallets.map(wallet => {
      // Logic to penalize popular wallets
      const copyRisk = wallet.followerCount > 2000 ? 80 : 20;

      const firstSeen = Date.now() - (Math.random() * 1000 * 60 * 60 * 168); // Wallets are discovered over time
      const crowdSaturation = (wallet.followerCount / 5000) * 100;
      
      const scoreInputs = {
        xSignal: wallet.hasOfficialAlias ? 70 : 30,
        walletSignal: wallet.winRate * 100,
        trust: wallet.pnl > 1000000 ? 95 : 60,
        risk: copyRisk,
        crowdSaturation,
        firstSeen
      };

      const compositeAlpha = calculateCompositeScore(scoreInputs);

      return {
        id: `w_${wallet.address}`,
        module: 'wallet',
        name: wallet.alias || 'Elite Hunter',
        category: wallet.specialization, // e.g. 'Token Sniper', 'NFT Sweeper'
        links: {
          source: 'On-chain Analysis',
          explorer: `https://debank.com/profile/${wallet.address}`
        },
        timestamps: {
          firstSeen,
          capturedAt: Date.now()
        },
        freshness: determineFreshness(firstSeen, crowdSaturation),
        crowdState: crowdSaturation > 70 ? 'Mainstream' : 'Smart Money Only',
        scores: {
          ...scoreInputs,
          compositeAlpha
        },
        thesis: `High alpha-rate hunter with ${wallet.winRate * 100}% win rate. Lead time is exceptional.`,
        researchNote: `Total PNL: $${wallet.pnl}. specialization: ${wallet.specialization}.`,
        actionSuggestion: getActionSuggestion(compositeAlpha, scoreInputs.risk),
        positives: ['Consistent win rate', 'Low copy-risk'],
        negatives: ['High slippage risk'],
        scoreReasons: ['Lead time velocity', 'Success rate'],
        evidence: wallet
      };
    });
  }
}
