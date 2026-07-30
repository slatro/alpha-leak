import { AlphaOpportunity } from './types';
import { TokenDiscoveryEngine } from './modules/TokenEngine';
import { NFTDiscoveryEngine } from './modules/NFTEngine';
import { AirdropDiscoveryEngine } from './modules/AirdropEngine';
import { NarrativeDiscoveryEngine } from './modules/NarrativeEngine';
import { WalletDiscoveryEngine } from './modules/WalletEngine';
import { deduplicate, filterAlpha } from './dedupe';

export class DiscoveryEngine {
  private tokens = new TokenDiscoveryEngine();
  private nfts = new NFTDiscoveryEngine();
  private airdrops = new AirdropDiscoveryEngine();
  private narratives = new NarrativeDiscoveryEngine();
  private wallets = new WalletDiscoveryEngine();

  async getRankedAlpha(rawInputs: Record<string, any[]>): Promise<AlphaOpportunity[]> {
    const results = await Promise.all([
      this.tokens.discover(rawInputs.tokens || []),
      this.nfts.discover(rawInputs.nfts || []),
      this.airdrops.discover(rawInputs.airdrops || []),
      this.narratives.discover(rawInputs.narratives || []),
      this.wallets.discover(rawInputs.wallets || [])
    ]);

    // Flatten all modules into one list
    const flatList = results.flat();

    // Aggressive Filtering & Deduplication
    const filtered = filterAlpha(flatList);
    const unique = deduplicate(filtered);

    // Final Actionable Ranking by Composite Score
    return unique.sort((a, b) => b.scores.compositeAlpha - a.scores.compositeAlpha);
  }
}
