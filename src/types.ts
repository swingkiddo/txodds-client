import { PublicKey } from "@solana/web3.js";

export interface SoccerFixtureClock {
  Running: boolean;
  Seconds: number;
}

export interface SoccerScore {
  Goals?: number;
  YellowCards?: number;
  RedCards?: number;
  Corners?: number;
}

export interface SoccerTotalScore {
  H1?: SoccerScore;
  HT?: SoccerScore;
  H2?: SoccerScore;
  ET1?: SoccerScore;
  ET2?: SoccerScore;
  PE?: SoccerScore;
  ETTotal?: SoccerScore;
  Total?: SoccerScore;
}

export interface SoccerFixtureScore {
  Participant1: SoccerTotalScore;
  Participant2: SoccerTotalScore;
}

export interface SoccerUpdateReference {
  Clock?: SoccerFixtureClock;
  FreeKickType?: string;
  GoalType?: string;
  Minutes?: number;
  Outcome?: string;
  PlayerId?: number;
  PlayerInId?: number;
  PlayerOutId?: number;
  ThrowInType?: string;
  Type?: string;
}

export interface SoccerData {
  Action?: string;
  Participant?: number;
  PlayerId?: number;
  GoalType?: string;
  Outcome?: string;
  FreeKickType?: string;
  ThrowInType?: string;
  Type?: string;
  StatusId?: number;
  Minutes?: number;
  PlayerInId?: number;
  PlayerOutId?: number;
  Goal?: boolean;
  Corner?: boolean;
  Penalty?: boolean;
  RedCard?: boolean;
  YellowCard?: boolean;
  VAR?: boolean;
  New?: SoccerUpdateReference;
  Previous?: SoccerUpdateReference;
}

export interface SoccerPlayerStats {
  goals: number;
  shots: number;
  ownGoals: number;
  penaltyAttempts: number;
  penaltyGoals: number;
  yellowCards: number;
  redCards: number;
}

export interface SoccerFixturePlayerStats {
  Participant1: Record<string, SoccerPlayerStats>;
  Participant2: Record<string, SoccerPlayerStats>;
}

export interface Fixture {
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
  Ts: number;
}

export interface OddsPayload {
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
  Pct: string[];
}

export interface Scores {
  FixtureId: number;
  GameState: string;
  StartTime: number;
  IsTeam: boolean;
  FixtureGroupId: number;
  CompetitionId: number;
  CountryId: number;
  SportId: number;
  Participant1IsHome: boolean;
  Participant2Id: number;
  Participant1Id: number;
  Action: string;
  Id: number;
  Ts: number;
  ConnectionId: number;
  Seq: number;
  CoverageSecondaryData?: boolean;
  CoverageType?: string;
  StatusId?: number;
  Type?: string;
  Confirmed?: boolean;
  Clock?: SoccerFixtureClock;
  Score?: SoccerFixtureScore;
  Data?: SoccerData;
  Stats: Record<string, number>;
  Participant?: number;
  Possession?: number;
  PossessionType?: string;
  PlayerStats?: SoccerFixturePlayerStats;
}

export interface ScoreStat {
  key: number;
  value: number;
  period: number;
}

export interface ScoresUpdateStats {
  updateCount: number;
  minTimestamp: number;
  maxTimestamp: number;
}

export interface ScoresBatchSummary {
  fixtureId: number;
  updateStats: ScoresUpdateStats;
  eventStatsSubTreeRoot: number[];
}

export interface ScoresStatValidation {
  ts: number;
  statToProve: ScoreStat;
  eventStatRoot: number[];
  summary: ScoresBatchSummary;
  statProof: ProofNode[];
  subTreeProof: ProofNode[];
  mainTreeProof: ProofNode[];
  statToProve2?: ScoreStat;
  statProof2?: ProofNode[];
}

export interface ScoresStatValidationV2 {
  ts: number;
  statsToProve?: ScoreStat[];
  eventStatRoot: number[];
  summary: ScoresBatchSummary;
  statProofs?: ProofNode[][];
  subTreeProof: ProofNode[];
  mainTreeProof: ProofNode[];
}

export interface FixtureUpdateStats {
  updateCount: number;
  minTimestamp: number;
  maxTimestamp: number;
}

export interface FixtureBatchSummary {
  fixtureId: number;
  competitionId: number;
  competition: string;
  updateStats: FixtureUpdateStats;
  updateSubTreeRoot: number[];
}

export interface FixtureValidation {
  snapshot: Fixture;
  summary: FixtureBatchSummary;
  subTreeProof: ProofNode[];
  mainTreeProof: ProofNode[];
}

export interface BatchMetadata {
  totalUpdateCount: number;
  numUniqueFixtures: number;
  overallBatchStartTs: number;
  overallBatchEndTs: number;
}

export interface FixtureBatchValidation {
  metadata: BatchMetadata;
  proof: ProofNode[];
}

export interface OddsUpdateStats {
  updateCount: number;
  minTimestamp: number;
  maxTimestamp: number;
}

export interface OddsBatchSummary {
  fixtureId: number;
  updateStats: OddsUpdateStats;
  oddsSubTreeRoot: number[];
}

export interface OddsValidation {
  odds: OddsPayload;
  summary: OddsBatchSummary;
  subTreeProof: ProofNode[];
  mainTreeProof: ProofNode[];
}

export interface TokenResponse {
  token: string;
}

export interface ActivationPayload {
  txSig: string;
  walletSignature: string;
  leagues: number[];
}

export interface PurchaseQuoteRequest {
  buyerPubkey: string;
  txlineAmount: number;
}

export interface PurchaseQuoteResponse {
  transactionBase64: string;
  baseUsdtCost: number;
  feeUsdtAmount: number;
  totalUsdtCharged: number;
}

export interface ProofNode {
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
