import { AlphaOpportunity } from '../types';
import { calculateCompositeScore, determineFreshness, getActionSuggestion } from '../scoring';

export class AirdropDiscoveryEngine {
  async discover(rawCampaigns: any[]): Promise<AlphaOpportunity[]> {
    return rawCampaigns.map(camp => {
      // Logic to reject over-farmed campaigns
      if (camp.participantCount > 500000) return null;

      const firstSeen = Date.now() - (Math.random() * 1000 * 60 * 60 * 72);
      const crowdSaturation = this.evaluateCrowd(camp);
      
      const scoreInputs = {
        xSignal: camp.mentionVelocity > 2.0 ? 80 : 45,
        walletSignal: 0, // Airdrops usually don't have direct wallet signals initially
        trust: camp.fundingAmount > 10000000 ? 95 : 60, // Trust linked to funding and VCs
        risk: camp.isOfficial ? 10 : 90,
        crowdSaturation,
        firstSeen
      };

      const compositeAlpha = calculateCompositeScore(scoreInputs);

      return {
        id: `a_${camp.id}`,
        module: 'airdrop',
        name: camp.projectName,
        category: camp.type, // e.g. 'Testnet', 'Node Operator', 'Social Quest'
        links: {
          source: 'Project Docs',
          portal: camp.officialPortal,
          twitter: camp.twitter
        },
        timestamps: {
          firstSeen,
          capturedAt: Date.now()
        },
        freshness: determineFreshness(firstSeen, crowdSaturation),
        crowdState: crowdSaturation > 60 ? 'Saturated' : 'Smart Money Only',
        scores: {
          ...scoreInputs,
          compositeAlpha
        },
        thesis: `High-trust team with ${camp.fundingAmount}M funding. Niche role gates detected.`,
        researchNote: `Official testnet age: ${camp.age}. Role depth: ${camp.roles.length}.`,
        actionSuggestion: getActionSuggestion(compositeAlpha, scoreInputs.risk),
        positives: ['Top tier VCs', 'Role-gated access'],
        negatives: ['High effort required'],
        scoreReasons: ['VC Quality', 'Low public saturation'],
        evidence: camp
      };
    }).filter(Boolean) as AlphaOpportunity[];
  }

  private evaluateCrowd(camp: any): number {
    return camp.discordMemberCount > 200000 ? 90 : 30;
  }
}
