import {
  SoccerFixtureClock,
  SoccerScore,
  SoccerTotalScore,
  SoccerFixtureScore,
  SoccerUpdateReference,
  SoccerData,
  SoccerPlayerStats,
  SoccerFixturePlayerStats,
  ProofNode,
  ScoreStat,
  ScoresUpdateStats,
  ScoresBatchSummary,
  ScoresStatValidation,
  ScoresStatValidationV2,
  FixtureUpdateStats,
  FixtureBatchSummary,
  FixtureValidation,
  BatchMetadata,
  FixtureBatchValidation,
  OddsUpdateStats,
  OddsBatchSummary,
  OddsValidation,
  SseMessage,
  Fixture,
  OddsPayload,
  Scores,
  PurchaseQuoteResponse,
  SubscribeAccounts,
  TokenResponse,
  ActivationPayload,
  PurchaseQuoteRequest,
} from "../src/types";

export function isSoccerFixtureClock(obj: unknown): obj is SoccerFixtureClock {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return typeof o.Running === "boolean" && typeof o.Seconds === "number";
}

export function isSoccerScore(obj: unknown): obj is SoccerScore {
  if (!obj || typeof obj !== "object") return false;
  return true;
}

export function isSoccerTotalScore(obj: unknown): obj is SoccerTotalScore {
  if (!obj || typeof obj !== "object") return false;
  return true;
}

export function isSoccerFixtureScore(obj: unknown): obj is SoccerFixtureScore {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return isSoccerTotalScore(o.Participant1) && isSoccerTotalScore(o.Participant2);
}

export function isSoccerUpdateReference(obj: unknown): obj is SoccerUpdateReference {
  if (!obj || typeof obj !== "object") return false;
  return true;
}

export function isSoccerData(obj: unknown): obj is SoccerData {
  if (!obj || typeof obj !== "object") return false;
  return true;
}

export function isSoccerPlayerStats(obj: unknown): obj is SoccerPlayerStats {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.goals === "number" &&
    typeof o.shots === "number" &&
    typeof o.ownGoals === "number" &&
    typeof o.penaltyAttempts === "number" &&
    typeof o.penaltyGoals === "number" &&
    typeof o.yellowCards === "number" &&
    typeof o.redCards === "number"
  );
}

export function isSoccerFixturePlayerStats(obj: unknown): obj is SoccerFixturePlayerStats {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.Participant1 === "object" && o.Participant1 !== null &&
    Object.values(o.Participant1 as Record<string, unknown>).every(v => isSoccerPlayerStats(v)) &&
    typeof o.Participant2 === "object" && o.Participant2 !== null &&
    Object.values(o.Participant2 as Record<string, unknown>).every(v => isSoccerPlayerStats(v))
  );
}

export function isProofNode(obj: unknown): obj is ProofNode {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    Array.isArray(o.hash) && o.hash.every((h: unknown) => typeof h === "number") &&
    typeof o.isRightSibling === "boolean"
  );
}

export function isScoreStat(obj: unknown): obj is ScoreStat {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.key === "number" &&
    typeof o.value === "number" &&
    typeof o.period === "number"
  );
}

export function isScoresUpdateStats(obj: unknown): obj is ScoresUpdateStats {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.updateCount === "number" &&
    typeof o.minTimestamp === "number" &&
    typeof o.maxTimestamp === "number"
  );
}

export function isScoresBatchSummary(obj: unknown): obj is ScoresBatchSummary {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.fixtureId === "number" &&
    isScoresUpdateStats(o.updateStats) &&
    Array.isArray(o.eventStatsSubTreeRoot) &&
    o.eventStatsSubTreeRoot.every((v: unknown) => typeof v === "number")
  );
}

export function isScoresStatValidation(obj: unknown): obj is ScoresStatValidation {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.ts === "number" &&
    isScoreStat(o.statToProve) &&
    Array.isArray(o.eventStatRoot) &&
    o.eventStatRoot.every((v: unknown) => typeof v === "number") &&
    isScoresBatchSummary(o.summary) &&
    Array.isArray(o.statProof) &&
    o.statProof.every((v: unknown) => isProofNode(v)) &&
    Array.isArray(o.subTreeProof) &&
    o.subTreeProof.every((v: unknown) => isProofNode(v)) &&
    Array.isArray(o.mainTreeProof) &&
    o.mainTreeProof.every((v: unknown) => isProofNode(v))
  );
}

export function isScoresStatValidationV2(obj: unknown): obj is ScoresStatValidationV2 {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.ts === "number" &&
    Array.isArray(o.eventStatRoot) &&
    o.eventStatRoot.every((v: unknown) => typeof v === "number") &&
    isScoresBatchSummary(o.summary) &&
    Array.isArray(o.subTreeProof) &&
    o.subTreeProof.every((v: unknown) => isProofNode(v)) &&
    Array.isArray(o.mainTreeProof) &&
    o.mainTreeProof.every((v: unknown) => isProofNode(v))
  );
}

export function isFixtureUpdateStats(obj: unknown): obj is FixtureUpdateStats {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.updateCount === "number" &&
    typeof o.minTimestamp === "number" &&
    typeof o.maxTimestamp === "number"
  );
}

export function isFixtureBatchSummary(obj: unknown): obj is FixtureBatchSummary {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.fixtureId === "number" &&
    typeof o.competitionId === "number" &&
    typeof o.competition === "string" &&
    isFixtureUpdateStats(o.updateStats) &&
    Array.isArray(o.updateSubTreeRoot) &&
    o.updateSubTreeRoot.every((v: unknown) => typeof v === "number")
  );
}

export function isFixtureValidation(obj: unknown): obj is FixtureValidation {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    isFixture(o.snapshot) &&
    isFixtureBatchSummary(o.summary) &&
    Array.isArray(o.subTreeProof) &&
    o.subTreeProof.every((v: unknown) => isProofNode(v)) &&
    Array.isArray(o.mainTreeProof) &&
    o.mainTreeProof.every((v: unknown) => isProofNode(v))
  );
}

export function isBatchMetadata(obj: unknown): obj is BatchMetadata {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.totalUpdateCount === "number" &&
    typeof o.numUniqueFixtures === "number" &&
    typeof o.overallBatchStartTs === "number" &&
    typeof o.overallBatchEndTs === "number"
  );
}

export function isFixtureBatchValidation(obj: unknown): obj is FixtureBatchValidation {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    isBatchMetadata(o.metadata) &&
    Array.isArray(o.proof) &&
    o.proof.every((v: unknown) => isProofNode(v))
  );
}

export function isOddsUpdateStats(obj: unknown): obj is OddsUpdateStats {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.updateCount === "number" &&
    typeof o.minTimestamp === "number" &&
    typeof o.maxTimestamp === "number"
  );
}

export function isOddsBatchSummary(obj: unknown): obj is OddsBatchSummary {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.fixtureId === "number" &&
    isOddsUpdateStats(o.updateStats) &&
    Array.isArray(o.oddsSubTreeRoot) &&
    o.oddsSubTreeRoot.every((v: unknown) => typeof v === "number")
  );
}

export function isOddsValidation(obj: unknown): obj is OddsValidation {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    isOddsPayload(o.odds) &&
    isOddsBatchSummary(o.summary) &&
    Array.isArray(o.subTreeProof) &&
    o.subTreeProof.every((v: unknown) => isProofNode(v)) &&
    Array.isArray(o.mainTreeProof) &&
    o.mainTreeProof.every((v: unknown) => isProofNode(v))
  );
}

export function isSseMessage(obj: unknown): obj is SseMessage {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return typeof o.data === "string";
}

export function isFixture(obj: unknown): obj is Fixture {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.FixtureId === "number" &&
    typeof o.StartTime === "number" &&
    typeof o.Participant1 === "string" &&
    typeof o.Participant2 === "string" &&
    typeof o.Participant1IsHome === "boolean" &&
    typeof o.Competition === "string" &&
    typeof o.CompetitionId === "number" &&
    typeof o.Participant1Id === "number" &&
    typeof o.Participant2Id === "number" &&
    typeof o.FixtureGroupId === "number" &&
    typeof o.Ts === "number"
  );
}

export function isOddsPayload(obj: unknown): obj is OddsPayload {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.FixtureId === "number" &&
    typeof o.MessageId === "string" &&
    typeof o.Ts === "number" &&
    typeof o.Bookmaker === "string" &&
    typeof o.BookmakerId === "number" &&
    typeof o.SuperOddsType === "string" &&
    (typeof o.GameState === "string" || o.GameState === null) &&
    typeof o.InRunning === "boolean" &&
    (typeof o.MarketParameters === "string" || o.MarketParameters === null) &&
    (typeof o.MarketPeriod === "string" || o.MarketPeriod === null) &&
    Array.isArray(o.PriceNames) &&
    o.PriceNames.every((v: unknown) => typeof v === "string") &&
    Array.isArray(o.Prices) &&
    o.Prices.every((v: unknown) => typeof v === "number") &&
    Array.isArray(o.Pct) &&
    o.Pct.every((v: unknown) => typeof v === "string")
  );
}

export function isScores(obj: unknown): obj is Scores {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.FixtureId === "number" &&
    typeof o.GameState === "string" &&
    typeof o.StartTime === "number" &&
    typeof o.IsTeam === "boolean" &&
    typeof o.FixtureGroupId === "number" &&
    typeof o.CompetitionId === "number" &&
    typeof o.CountryId === "number" &&
    typeof o.SportId === "number" &&
    typeof o.Participant1IsHome === "boolean" &&
    typeof o.Participant2Id === "number" &&
    typeof o.Participant1Id === "number" &&
    typeof o.Action === "string" &&
    typeof o.Id === "number" &&
    typeof o.Ts === "number" &&
    typeof o.ConnectionId === "number" &&
    typeof o.Seq === "number" &&
    typeof o.Stats === "object" && o.Stats !== null &&
    Object.values(o.Stats as Record<string, unknown>).every((v: unknown) => typeof v === "number")
  );
}

export function isPurchaseQuoteResponse(obj: unknown): obj is PurchaseQuoteResponse {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.transactionBase64 === "string" &&
    typeof o.baseUsdtCost === "number" &&
    typeof o.feeUsdtAmount === "number" &&
    typeof o.totalUsdtCharged === "number"
  );
}

export function isSubscribeAccounts(obj: unknown): obj is SubscribeAccounts {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.user === "object" && o.user !== null &&
    typeof o.pricingMatrix === "object" && o.pricingMatrix !== null &&
    typeof o.tokenMint === "object" && o.tokenMint !== null &&
    typeof o.userTokenAccount === "object" && o.userTokenAccount !== null &&
    typeof o.tokenTreasuryVault === "object" && o.tokenTreasuryVault !== null &&
    typeof o.tokenTreasuryPda === "object" && o.tokenTreasuryPda !== null &&
    typeof o.tokenProgram === "object" && o.tokenProgram !== null &&
    typeof o.systemProgram === "object" && o.systemProgram !== null &&
    typeof o.associatedTokenProgram === "object" && o.associatedTokenProgram !== null
  );
}

export function isTokenResponse(obj: unknown): obj is TokenResponse {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return typeof o.token === "string";
}

export function isActivationPayload(obj: unknown): obj is ActivationPayload {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.txSig === "string" &&
    typeof o.walletSignature === "string" &&
    Array.isArray(o.leagues) &&
    o.leagues.every((v: unknown) => typeof v === "number")
  );
}

export function isPurchaseQuoteRequest(obj: unknown): obj is PurchaseQuoteRequest {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.buyerPubkey === "string" &&
    typeof o.txlineAmount === "number"
  );
}
