import { describe, it, expect } from "vitest";
import {
  isFixture,
  isOddsPayload,
  isScores,
  isScoresStatValidation,
  isScoresStatValidationV2,
  isFixtureValidation,
  isFixtureBatchValidation,
  isOddsValidation,
  isPurchaseQuoteResponse,
  isSoccerFixtureClock,
  isSoccerScore,
  isSoccerTotalScore,
  isSoccerFixtureScore,
  isSoccerUpdateReference,
  isSoccerData,
  isSoccerPlayerStats,
  isSoccerFixturePlayerStats,
  isProofNode,
  isScoreStat,
  isScoresUpdateStats,
  isScoresBatchSummary,
  isFixtureUpdateStats,
  isFixtureBatchSummary,
  isBatchMetadata,
  isOddsUpdateStats,
  isOddsBatchSummary,
  isSseMessage,
  isSubscribeAccounts,
  isTokenResponse,
  isActivationPayload,
  isPurchaseQuoteRequest,
} from "./guards";
import fixturesData from "./fixtures/fixtures.json";
import oddsData from "./fixtures/odds.json";
import scoresData from "./fixtures/scores.json";
import statValidationData from "./fixtures/stat-validation.json";
import fixtureValidationData from "./fixtures/fixture-validation.json";
import batchValidationData from "./fixtures/batch-validation.json";
import oddsValidationData from "./fixtures/odds-validation.json";
import purchaseQuoteData from "./fixtures/purchase-quote.json";

describe("isFixture", () => {
  const validFixture = { ...fixturesData[0] };

  it("validates a real API response", () => {
    for (const item of fixturesData) {
      expect(isFixture(item)).toBe(true);
    }
  });

  it("rejects null", () => {
    expect(isFixture(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isFixture(undefined)).toBe(false);
  });

  it("rejects primitive values", () => {
    expect(isFixture("string")).toBe(false);
    expect(isFixture(42)).toBe(false);
    expect(isFixture(true)).toBe(false);
  });

  it("rejects empty object", () => {
    expect(isFixture({})).toBe(false);
  });

  it("rejects object with wrong field types", () => {
    expect(isFixture({ ...validFixture, FixtureId: "not-a-number" })).toBe(false);
  });

  it("accepts extra fields not in the type", () => {
    expect(isFixture({ ...validFixture, extraField: "whatever" })).toBe(true);
  });
});

describe("isOddsPayload", () => {
  const validItem = { ...oddsData[0] };

  it("validates a real API response", () => {
    for (const item of oddsData) {
      expect(isOddsPayload(item)).toBe(true);
    }
  });

  it("rejects null", () => {
    expect(isOddsPayload(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isOddsPayload(undefined)).toBe(false);
  });

  it("rejects primitive values", () => {
    expect(isOddsPayload("string")).toBe(false);
    expect(isOddsPayload(42)).toBe(false);
  });

  it("rejects empty object", () => {
    expect(isOddsPayload({})).toBe(false);
  });

  it("rejects object with wrong field types", () => {
    expect(isOddsPayload({ ...validItem, FixtureId: "not-a-number" })).toBe(false);
  });

  it("accepts null for nullable string fields", () => {
    expect(isOddsPayload({ ...validItem, GameState: null, MarketPeriod: null })).toBe(true);
  });

  it("accepts extra fields not in the type", () => {
    expect(isOddsPayload({ ...validItem, extraField: true })).toBe(true);
  });
});

describe("isScores", () => {
  it("validates a real API response", () => {
    for (const item of scoresData) {
      expect(isScores(item)).toBe(true);
    }
  });

  it("rejects null", () => {
    expect(isScores(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isScores(undefined)).toBe(false);
  });

  it("rejects primitive values", () => {
    expect(isScores("string")).toBe(false);
    expect(isScores(42)).toBe(false);
  });

  it("rejects empty object", () => {
    expect(isScores({})).toBe(false);
  });

  it("rejects object with wrong field types", () => {
    expect(isScores({ ...scoresData[0], FixtureId: "not-a-number" })).toBe(false);
  });

  it("accepts missing optional fields (Score, Clock, Data, PlayerStats)", () => {
    expect(isScores(scoresData[0])).toBe(true);
  });

  it("accepts extra fields not in the type", () => {
    expect(isScores({ ...scoresData[0], extraField: "x" })).toBe(true);
  });

  it("rejects null for non-nullable string field GameState", () => {
    expect(isScores({ ...scoresData[0], GameState: null })).toBe(false);
  });
});

describe("isScoresStatValidation", () => {
  it("validates a real API response", () => {
    expect(isScoresStatValidation(statValidationData)).toBe(true);
  });

  it("rejects null", () => {
    expect(isScoresStatValidation(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isScoresStatValidation(undefined)).toBe(false);
  });

  it("rejects empty object", () => {
    expect(isScoresStatValidation({})).toBe(false);
  });

  it("rejects object with wrong field types", () => {
    expect(isScoresStatValidation({ ...statValidationData, ts: "not-a-number" })).toBe(false);
  });
});

describe("isFixtureValidation", () => {
  it("validates a real API response", () => {
    expect(isFixtureValidation(fixtureValidationData)).toBe(true);
  });

  it("rejects null", () => {
    expect(isFixtureValidation(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isFixtureValidation(undefined)).toBe(false);
  });

  it("rejects empty object", () => {
    expect(isFixtureValidation({})).toBe(false);
  });

  it("rejects object with wrong field types", () => {
    expect(isFixtureValidation({ ...fixtureValidationData, snapshot: "not-an-object" })).toBe(false);
  });
});

describe("isFixtureBatchValidation", () => {
  it("validates a real API response", () => {
    expect(isFixtureBatchValidation(batchValidationData)).toBe(true);
  });

  it("rejects null", () => {
    expect(isFixtureBatchValidation(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isFixtureBatchValidation(undefined)).toBe(false);
  });

  it("rejects empty object", () => {
    expect(isFixtureBatchValidation({})).toBe(false);
  });

  it("rejects object with wrong field types", () => {
    expect(isFixtureBatchValidation({ ...batchValidationData, metadata: "not-an-object" })).toBe(false);
  });
});

describe("isOddsValidation", () => {
  it("validates a real API response", () => {
    expect(isOddsValidation(oddsValidationData)).toBe(true);
  });

  it("rejects null", () => {
    expect(isOddsValidation(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isOddsValidation(undefined)).toBe(false);
  });

  it("rejects empty object", () => {
    expect(isOddsValidation({})).toBe(false);
  });

  it("rejects object with wrong field types", () => {
    expect(isOddsValidation({ ...oddsValidationData, odds: "not-an-object" })).toBe(false);
  });
});

describe("isPurchaseQuoteResponse", () => {
  it("validates a real API response", () => {
    expect(isPurchaseQuoteResponse(purchaseQuoteData)).toBe(true);
  });

  it("rejects null", () => {
    expect(isPurchaseQuoteResponse(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isPurchaseQuoteResponse(undefined)).toBe(false);
  });

  it("rejects empty object", () => {
    expect(isPurchaseQuoteResponse({})).toBe(false);
  });

  it("rejects object with wrong field types", () => {
    expect(isPurchaseQuoteResponse({ ...purchaseQuoteData, transactionBase64: 42 })).toBe(false);
  });
});

describe("nested types", () => {
  it("isSoccerFixtureClock", () => {
    const valid = { Running: true, Seconds: 45 };
    expect(isSoccerFixtureClock(valid)).toBe(true);
    expect(isSoccerFixtureClock(null)).toBe(false);
    expect(isSoccerFixtureClock({ Running: "yes", Seconds: 45 })).toBe(false);
    expect(isSoccerFixtureClock({ Running: true, Seconds: "45" })).toBe(false);
    expect(isSoccerFixtureClock({})).toBe(false);
  });

  it("isSoccerScore", () => {
    expect(isSoccerScore({ Goals: 2, YellowCards: 1 })).toBe(true);
    expect(isSoccerScore(null)).toBe(false);
    expect(isSoccerScore({})).toBe(true);
  });

  it("isSoccerTotalScore", () => {
    const valid = { Total: { Goals: 2, YellowCards: 1 } };
    expect(isSoccerTotalScore(valid)).toBe(true);
    expect(isSoccerTotalScore(null)).toBe(false);
    expect(isSoccerTotalScore({})).toBe(true);
  });

  it("isSoccerFixtureScore", () => {
    const valid = {
      Participant1: { Total: { Goals: 1 } },
      Participant2: { Total: { Goals: 2 } },
    };
    expect(isSoccerFixtureScore(valid)).toBe(true);
    expect(isSoccerFixtureScore(null)).toBe(false);
    expect(isSoccerFixtureScore({})).toBe(false);
    expect(isSoccerFixtureScore({ Participant1: {}, Participant2: {} })).toBe(true);
  });

  it("isSoccerUpdateReference", () => {
    expect(isSoccerUpdateReference({ Clock: { Running: true, Seconds: 10 }, Outcome: "OnTarget" })).toBe(true);
    expect(isSoccerUpdateReference(null)).toBe(false);
    expect(isSoccerUpdateReference({})).toBe(true);
  });

  it("isSoccerData", () => {
    expect(isSoccerData({ Action: "shot", New: { Clock: { Running: true, Seconds: 5 } } })).toBe(true);
    expect(isSoccerData(null)).toBe(false);
    expect(isSoccerData({})).toBe(true);
  });

  it("isSoccerPlayerStats", () => {
    const valid = { goals: 1, shots: 3, ownGoals: 0, penaltyAttempts: 0, penaltyGoals: 0, yellowCards: 1, redCards: 0 };
    expect(isSoccerPlayerStats(valid)).toBe(true);
    expect(isSoccerPlayerStats(null)).toBe(false);
    expect(isSoccerPlayerStats({ goals: 1 })).toBe(false);
    expect(isSoccerPlayerStats({})).toBe(false);
  });

  it("isSoccerFixturePlayerStats", () => {
    const validPlayerStats = { goals: 1, shots: 3, ownGoals: 0, penaltyAttempts: 0, penaltyGoals: 0, yellowCards: 1, redCards: 0 };
    const valid = {
      Participant1: { "100": validPlayerStats },
      Participant2: { "200": validPlayerStats },
    };
    expect(isSoccerFixturePlayerStats(valid)).toBe(true);
    expect(isSoccerFixturePlayerStats(null)).toBe(false);
    expect(isSoccerFixturePlayerStats({})).toBe(false);
    expect(isSoccerFixturePlayerStats({ Participant1: {}, Participant2: {} })).toBe(true);
  });

  it("isProofNode", () => {
    const valid = { hash: [123, 456], isRightSibling: true };
    expect(isProofNode(valid)).toBe(true);
    expect(isProofNode(null)).toBe(false);
    expect(isProofNode({ hash: [123], isRightSibling: false })).toBe(true);
    expect(isProofNode({ hash: "not-array", isRightSibling: true })).toBe(false);
    expect(isProofNode({ hash: [123], isRightSibling: "yes" })).toBe(false);
    expect(isProofNode({})).toBe(false);
  });

  it("isScoreStat", () => {
    const valid = { key: 1, value: 2, period: 0 };
    expect(isScoreStat(valid)).toBe(true);
    expect(isScoreStat(null)).toBe(false);
    expect(isScoreStat({ key: 1, value: 2, period: "0" })).toBe(false);
    expect(isScoreStat({})).toBe(false);
  });

  it("isScoresUpdateStats", () => {
    const valid = { updateCount: 5, minTimestamp: 100, maxTimestamp: 200 };
    expect(isScoresUpdateStats(valid)).toBe(true);
    expect(isScoresUpdateStats(null)).toBe(false);
    expect(isScoresUpdateStats({ updateCount: "5", minTimestamp: 100, maxTimestamp: 200 })).toBe(false);
    expect(isScoresUpdateStats({})).toBe(false);
  });

  it("isScoresBatchSummary", () => {
    const valid = {
      fixtureId: 1,
      updateStats: { updateCount: 5, minTimestamp: 100, maxTimestamp: 200 },
      eventStatsSubTreeRoot: [18, 221, 146],
    };
    expect(isScoresBatchSummary(valid)).toBe(true);
    expect(isScoresBatchSummary(null)).toBe(false);
    expect(isScoresBatchSummary({ ...valid, fixtureId: "bad" })).toBe(false);
  });

  it("isFixtureUpdateStats", () => {
    const valid = { updateCount: 1, minTimestamp: 100, maxTimestamp: 200 };
    expect(isFixtureUpdateStats(valid)).toBe(true);
    expect(isFixtureUpdateStats(null)).toBe(false);
    expect(isFixtureUpdateStats({})).toBe(false);
  });

  it("isFixtureBatchSummary", () => {
    const valid = {
      fixtureId: 1,
      competitionId: 72,
      competition: "World Cup",
      updateStats: { updateCount: 1, minTimestamp: 100, maxTimestamp: 200 },
      updateSubTreeRoot: [153, 137],
    };
    expect(isFixtureBatchSummary(valid)).toBe(true);
    expect(isFixtureBatchSummary(null)).toBe(false);
    expect(isFixtureBatchSummary({ ...valid, competition: 42 })).toBe(false);
    expect(isFixtureBatchSummary({})).toBe(false);
  });

  it("isBatchMetadata", () => {
    const valid = { totalUpdateCount: 258, numUniqueFixtures: 258, overallBatchStartTs: 100, overallBatchEndTs: 200 };
    expect(isBatchMetadata(valid)).toBe(true);
    expect(isBatchMetadata(null)).toBe(false);
    expect(isBatchMetadata({ ...valid, totalUpdateCount: "bad" })).toBe(false);
    expect(isBatchMetadata({})).toBe(false);
  });

  it("isOddsUpdateStats", () => {
    const valid = { updateCount: 5, minTimestamp: 100, maxTimestamp: 200 };
    expect(isOddsUpdateStats(valid)).toBe(true);
    expect(isOddsUpdateStats(null)).toBe(false);
    expect(isOddsUpdateStats({})).toBe(false);
  });

  it("isOddsBatchSummary", () => {
    const valid = {
      fixtureId: 1,
      updateStats: { updateCount: 5, minTimestamp: 100, maxTimestamp: 200 },
      oddsSubTreeRoot: [219, 133],
    };
    expect(isOddsBatchSummary(valid)).toBe(true);
    expect(isOddsBatchSummary(null)).toBe(false);
    expect(isOddsBatchSummary({ ...valid, fixtureId: "bad" })).toBe(false);
    expect(isOddsBatchSummary({})).toBe(false);
  });

  it("isScoresStatValidationV2", () => {
    const valid = {
      ts: 123,
      eventStatRoot: [0, 0],
      summary: {
        fixtureId: 1,
        updateStats: { updateCount: 1, minTimestamp: 100, maxTimestamp: 200 },
        eventStatsSubTreeRoot: [0, 0],
      },
      subTreeProof: [{ hash: [1], isRightSibling: false }],
      mainTreeProof: [{ hash: [2], isRightSibling: true }],
    };
    expect(isScoresStatValidationV2(valid)).toBe(true);
    expect(isScoresStatValidationV2(null)).toBe(false);
    expect(isScoresStatValidationV2({ ...valid, ts: "bad" })).toBe(false);
    expect(isScoresStatValidationV2({})).toBe(false);
  });

  it("isSseMessage", () => {
    expect(isSseMessage({ data: "hello" })).toBe(true);
    expect(isSseMessage(null)).toBe(false);
    expect(isSseMessage({ data: 42 })).toBe(false);
    expect(isSseMessage({})).toBe(false);
  });

  it("isSubscribeAccounts", () => {
    const valid = {
      user: {},
      pricingMatrix: {},
      tokenMint: {},
      userTokenAccount: {},
      tokenTreasuryVault: {},
      tokenTreasuryPda: {},
      tokenProgram: {},
      systemProgram: {},
      associatedTokenProgram: {},
    };
    expect(isSubscribeAccounts(valid)).toBe(true);
    expect(isSubscribeAccounts(null)).toBe(false);
    expect(isSubscribeAccounts({ ...valid, user: "not-object" })).toBe(false);
    expect(isSubscribeAccounts({})).toBe(false);
  });

  it("isTokenResponse", () => {
    expect(isTokenResponse({ token: "abc123" })).toBe(true);
    expect(isTokenResponse(null)).toBe(false);
    expect(isTokenResponse({ token: 42 })).toBe(false);
    expect(isTokenResponse({})).toBe(false);
  });

  it("isActivationPayload", () => {
    const valid = { txSig: "sig1", walletSignature: "sig2", leagues: [1, 2, 3] };
    expect(isActivationPayload(valid)).toBe(true);
    expect(isActivationPayload(null)).toBe(false);
    expect(isActivationPayload({ ...valid, leagues: "not-array" })).toBe(false);
    expect(isActivationPayload({ ...valid, txSig: 42 })).toBe(false);
    expect(isActivationPayload({})).toBe(false);
  });

  it("isPurchaseQuoteRequest", () => {
    const valid = { buyerPubkey: "pubkey123", txlineAmount: 100 };
    expect(isPurchaseQuoteRequest(valid)).toBe(true);
    expect(isPurchaseQuoteRequest(null)).toBe(false);
    expect(isPurchaseQuoteRequest({ ...valid, buyerPubkey: 42 })).toBe(false);
    expect(isPurchaseQuoteRequest({ ...valid, txlineAmount: "bad" })).toBe(false);
    expect(isPurchaseQuoteRequest({})).toBe(false);
  });
});
