# Alpha Leak Engine: Private Intelligence Core

This directory contains the backend-only intelligence engine for Alpha Leak.

## Core Philosophy
The system is designed to **reject** already viral opportunities. It prioritizes:
1.  **Wallet-First Movement**: On-chain signals before social hype.
2.  **Crowd Inversion**: High awareness = Low alpha score.
3.  **Trust Stack**: Team, VC, and Founder credibility.

## Directory Structure
-   `src/engine/types.ts`: The Universal Output Contract (JSON schema).
-   `src/engine/scoring.ts`: Composite Alpha Scoring formulas.
-   `src/engine/dedupe.ts`: Aggressive deduplication and anti-spam filters.
-   `src/engine/modules/`: Module-specific discovery logic.

## Module Logic
1.  **Token Discovery**: Scans fresh pairs + catalysts. Rejects generic branding.
2.  **NFT Discovery**: Floor anomaly detection before X-hype. Rejects blue chips.
3.  **Airdrop Alpha**: Official role-gate tracking. Rejects quest-aggregator spam.
4.  **Narrative Scout**: X-Account cluster analysis for emerging tradeable themes.
5.  **Smart Wallet**: Ranking hunters by lead-time and alpha-rate.

## Scoring Formula (Composite)
`AlphaScore = (Wallet * 0.35) + (Trust * 0.25) + (XSignal * 0.15) + (100-Crowd * 0.25)`

## Usage
The engine outputs a ranked JSON array of `AlphaOpportunity` objects, ready to be consumed by any frontend or alerting service.
