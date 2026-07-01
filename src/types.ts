import { PublicKey } from "@solana/web3.js";

export interface FixtureRecord {
  FixtureId: number;
  StartTime: number;
  Participant1: string;
  Participant2: string;
  Participant1IsHome: boolean;
  Competition: string;
  CompetitionId: number;
  Participant1Id: number;
  Participant2Id: number;
  FixtureGroupId: number;
  Status: string;
  Ts: number;
}

export interface OddsRecord {
  FixtureId: number;
  MessageId: string;
  Ts: number;
  Bookmaker: string;
  BookmakerId: number;
  SuperOddsType: string;
  GameState: string | null;
  InRunning: boolean;
  MarketParameters: string | null;
  MarketPeriod: string | null;
  PriceNames: string[];
  Prices: number[];
  Pct: number[];
}

export interface ScoresRecord {
  seq: number;
  ts: number;
  gameState: number;
  homeScore: number;
  awayScore: number;
  stats: Record<number, number>;
  fixtureId: number;
}

export interface StatValidationResult {
  ts: number;
  statToProve: {
    value: number;
    time: number;
  };
  eventStatRoot: number[];
  statProof: StatProofNode[];
  subTreeProof: StatProofNode[];
  mainTreeProof: StatProofNode[];
  summary: {
    fixtureId: number;
    updateStats: {
      updateCount: number;
      minTimestamp: number;
      maxTimestamp: number;
    };
    eventStatsSubTreeRoot: number[];
  };
  statToProve2?: {
    value: number;
    time: number;
  };
  statProof2?: StatProofNode[];
}

export interface StatProofNode {
  hash: number[];
  isRightSibling: boolean;
}

export interface SseMessage {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
}

export interface SubscribeAccounts {
  user: PublicKey;
  pricingMatrix: PublicKey;
  tokenMint: PublicKey;
  userTokenAccount: PublicKey;
  tokenTreasuryVault: PublicKey;
  tokenTreasuryPda: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
  associatedTokenProgram: PublicKey;
}
