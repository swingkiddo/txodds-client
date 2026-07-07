const tmpHome = `/tmp/txodds-api-test-${Date.now()}`;
const origHome = process.env.HOME;
process.env.HOME = tmpHome;

import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as nacl from "tweetnacl";
import { TxOddsClient } from "../src/client";
import { SseMessage } from "../src/types";
import fixturesData from "./fixtures/fixtures.json";
import oddsData from "./fixtures/odds.json";
import scoresData from "./fixtures/scores.json";
import statValidationData from "./fixtures/stat-validation.json";
import fixtureValidationData from "./fixtures/fixture-validation.json";
import batchValidationData from "./fixtures/batch-validation.json";
import oddsValidationData from "./fixtures/odds-validation.json";
import purchaseQuoteData from "./fixtures/purchase-quote.json";
import {
  isFixture,
  isOddsPayload,
  isScores,
  isScoresStatValidation,
  isFixtureValidation,
  isFixtureBatchValidation,
  isOddsValidation,
  isPurchaseQuoteResponse,
} from "./guards";

const DEVNET_BASE = "https://txline-dev.txodds.com/api";
const DEVNET_HOST = "https://txline-dev.txodds.com";

function mockFetch(data: unknown): void {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers({ "content-type": "application/json" }),
  } as Response);
}

function mockFetchWithText(text: string): void {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => { throw new Error("not json"); },
    text: async () => text,
    headers: new Headers({ "content-type": "text/plain" }),
  } as Response);
}

function mockFetchStream(dataChunks: string[]): void {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of dataChunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    body: stream,
    headers: new Headers({ "content-type": "text/event-stream" }),
  } as Response);
}

function mockFetchError(status: number, text: string): void {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: false,
    status,
    text: async () => text,
    headers: new Headers({ "content-type": "text/plain" }),
  } as Response);
}

afterAll(() => {
  process.env.HOME = origHome;
  try { fs.rmSync(tmpHome, { recursive: true }); } catch { /* ok */ }
});

describe("getFixturesSnapshot", () => {
  beforeEach(() => mockFetch(fixturesData));
  afterEach(() => vi.restoreAllMocks());

  it("returns fixture data", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getFixturesSnapshot();
    expect(result).toEqual(fixturesData);
  });

  it("calls /api/fixtures/snapshot", async () => {
    const client = TxOddsClient.devnet();
    await client.getFixturesSnapshot();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/fixtures/snapshot`,
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
  });

  it("passes competitionId query param", async () => {
    const client = TxOddsClient.devnet();
    await client.getFixturesSnapshot(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/fixtures/snapshot?competitionId=1`,
      expect.anything()
    );
  });

  it("sends Authorization header when JWT is set", async () => {
    const client = TxOddsClient.devnet();
    client.setJwt("test-jwt");
    await client.getFixturesSnapshot();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-jwt",
        }),
      })
    );
  });

  it("sends X-Api-Token header when apiToken is set", async () => {
    const client = TxOddsClient.devnet();
    client.setApiToken("test-api-token");
    await client.getFixturesSnapshot();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Api-Token": "test-api-token",
        }),
      })
    );
  });

  it("returns data matching Fixture type", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getFixturesSnapshot();
    for (const item of result) {
      expect(isFixture(item)).toBe(true);
    }
  });

  it("throws on non-ok response", async () => {
    vi.restoreAllMocks();
    mockFetchError(500, "Internal Server Error");
    const client = TxOddsClient.devnet();
    await expect(client.getFixturesSnapshot()).rejects.toThrow("TxODDS API 500 on /fixtures/snapshot: Internal Server Error");
  });
});

describe("getOddsSnapshot", () => {
  beforeEach(() => mockFetch(oddsData));
  afterEach(() => vi.restoreAllMocks());

  it("returns odds data", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getOddsSnapshot(18193785);
    expect(result).toEqual(oddsData);
  });

  it("calls /api/odds/snapshot/{fixtureId}", async () => {
    const client = TxOddsClient.devnet();
    await client.getOddsSnapshot(18193785);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/odds/snapshot/18193785`,
      expect.anything()
    );
  });

  it("returns data matching OddsPayload type", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getOddsSnapshot(18193785);
    for (const item of result) {
      expect(isOddsPayload(item)).toBe(true);
    }
  });
});

describe("getOddsUpdatesByTime", () => {
  beforeEach(() => mockFetch(oddsData));
  afterEach(() => vi.restoreAllMocks());

  it("returns odds data", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getOddsUpdatesByTime(20000, 10, 15);
    expect(result).toEqual(oddsData);
  });

  it("calls /api/odds/updates/{epochDay}/{hourOfDay}/{interval}", async () => {
    const client = TxOddsClient.devnet();
    await client.getOddsUpdatesByTime(20000, 10, 15);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/odds/updates/20000/10/15`,
      expect.anything()
    );
  });
});

describe("getScoresSnapshot", () => {
  beforeEach(() => mockFetch(scoresData));
  afterEach(() => vi.restoreAllMocks());

  it("returns scores data", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getScoresSnapshot(18193785);
    expect(result).toEqual(scoresData);
  });

  it("calls /api/scores/snapshot/{fixtureId}", async () => {
    const client = TxOddsClient.devnet();
    await client.getScoresSnapshot(18193785);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/scores/snapshot/18193785`,
      expect.anything()
    );
  });

  it("passes asOf query param", async () => {
    const client = TxOddsClient.devnet();
    await client.getScoresSnapshot(18193785, 1234567890);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/scores/snapshot/18193785?asOf=1234567890`,
      expect.anything()
    );
  });

  it("returns data matching Scores type", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getScoresSnapshot(18193785);
    for (const item of result) {
      expect(isScores(item)).toBe(true);
    }
  });
});

describe("getScoresUpdates", () => {
  beforeEach(() => mockFetch(scoresData));
  afterEach(() => vi.restoreAllMocks());

  it("returns scores data", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getScoresUpdates(18193785);
    expect(result).toEqual(scoresData);
  });

  it("calls /api/scores/updates/{fixtureId}", async () => {
    const client = TxOddsClient.devnet();
    await client.getScoresUpdates(18193785);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/scores/updates/18193785`,
      expect.anything()
    );
  });
});

describe("getScoresUpdatesByTime", () => {
  beforeEach(() => mockFetch(scoresData));
  afterEach(() => vi.restoreAllMocks());

  it("returns scores data", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getScoresUpdatesByTime(20000, 10, 15);
    expect(result).toEqual(scoresData);
  });

  it("calls /api/scores/updates/{epochDay}/{hourOfDay}/{interval}", async () => {
    const client = TxOddsClient.devnet();
    await client.getScoresUpdatesByTime(20000, 10, 15);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/scores/updates/20000/10/15`,
      expect.anything()
    );
  });
});

describe("getScoresHistorical", () => {
  beforeEach(() => mockFetch(scoresData));
  afterEach(() => vi.restoreAllMocks());

  it("returns scores data", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getScoresHistorical(18193785);
    expect(result).toEqual(scoresData);
  });

  it("calls /api/scores/historical/{fixtureId}", async () => {
    const client = TxOddsClient.devnet();
    await client.getScoresHistorical(18193785);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/scores/historical/18193785`,
      expect.anything()
    );
  });
});

describe("getStatValidation", () => {
  beforeEach(() => mockFetch(statValidationData));
  afterEach(() => vi.restoreAllMocks());

  it("returns stat validation data", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getStatValidation(18193785, 919, 1);
    expect(result).toEqual(statValidationData);
  });

  it("calls /api/scores/stat-validation with query params", async () => {
    const client = TxOddsClient.devnet();
    await client.getStatValidation(18193785, 919, 1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/scores/stat-validation?fixtureId=18193785&seq=919&statKey=1`,
      expect.anything()
    );
  });

  it("passes optional statKey2 param", async () => {
    const client = TxOddsClient.devnet();
    await client.getStatValidation(18193785, 919, 1, 2);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/scores/stat-validation?fixtureId=18193785&seq=919&statKey=1&statKey2=2`,
      expect.anything()
    );
  });

  it("returns data matching ScoresStatValidation type", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getStatValidation(18193785, 919, 1);
    expect(isScoresStatValidation(result)).toBe(true);
  });
});

describe("getFixturesUpdates", () => {
  beforeEach(() => mockFetch(fixturesData));
  afterEach(() => vi.restoreAllMocks());

  it("returns fixture data", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getFixturesUpdates(20000, 10);
    expect(result).toEqual(fixturesData);
  });

  it("calls /api/fixtures/updates/{epochDay}/{hourOfDay}", async () => {
    const client = TxOddsClient.devnet();
    await client.getFixturesUpdates(20000, 10);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/fixtures/updates/20000/10`,
      expect.anything()
    );
  });
});

describe("getFixtureValidation", () => {
  beforeEach(() => mockFetch(fixtureValidationData));
  afterEach(() => vi.restoreAllMocks());

  it("returns fixture validation data", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getFixtureValidation(18193785);
    expect(result).toEqual(fixtureValidationData);
  });

  it("calls /api/fixtures/validation with fixtureId", async () => {
    const client = TxOddsClient.devnet();
    await client.getFixtureValidation(18193785);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/fixtures/validation?fixtureId=18193785`,
      expect.anything()
    );
  });

  it("passes optional timestamp param", async () => {
    const client = TxOddsClient.devnet();
    await client.getFixtureValidation(18193785, 1234567890);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/fixtures/validation?fixtureId=18193785&timestamp=1234567890`,
      expect.anything()
    );
  });

  it("returns data matching FixtureValidation type", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getFixtureValidation(18193785);
    expect(isFixtureValidation(result)).toBe(true);
  });
});

describe("getFixtureBatchValidation", () => {
  beforeEach(() => mockFetch(batchValidationData));
  afterEach(() => vi.restoreAllMocks());

  it("returns batch validation data", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getFixtureBatchValidation(20000, 10);
    expect(result).toEqual(batchValidationData);
  });

  it("calls /api/fixtures/batch-validation with query params", async () => {
    const client = TxOddsClient.devnet();
    await client.getFixtureBatchValidation(20000, 10);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/fixtures/batch-validation?epochDay=20000&hourOfDay=10`,
      expect.anything()
    );
  });

  it("returns data matching FixtureBatchValidation type", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getFixtureBatchValidation(20000, 10);
    expect(isFixtureBatchValidation(result)).toBe(true);
  });
});

describe("getOddsUpdates", () => {
  beforeEach(() => mockFetch(oddsData));
  afterEach(() => vi.restoreAllMocks());

  it("returns odds data", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getOddsUpdates(18193785);
    expect(result).toEqual(oddsData);
  });

  it("calls /api/odds/updates/{fixtureId}", async () => {
    const client = TxOddsClient.devnet();
    await client.getOddsUpdates(18193785);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/odds/updates/18193785`,
      expect.anything()
    );
  });
});

describe("getOddsValidation", () => {
  beforeEach(() => mockFetch(oddsValidationData));
  afterEach(() => vi.restoreAllMocks());

  it("returns odds validation data", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getOddsValidation("1835931359:00003:000001-10021-stab", 1234567890);
    expect(result).toEqual(oddsValidationData);
  });

  it("calls /api/odds/validation with URL-encoded messageId", async () => {
    const client = TxOddsClient.devnet();
    const messageId = "1835931359:00003:000001-10021-stab";
    await client.getOddsValidation(messageId, 1234567890);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/odds/validation?messageId=${encodeURIComponent(messageId)}&ts=1234567890`,
      expect.anything()
    );
  });

  it("returns data matching OddsValidation type", async () => {
    const client = TxOddsClient.devnet();
    const result = await client.getOddsValidation("1835931359:00003:000001-10021-stab", 1234567890);
    expect(isOddsValidation(result)).toBe(true);
  });
});

describe("getPurchaseQuote", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns purchase quote data", async () => {
    mockFetch(purchaseQuoteData);
    const client = TxOddsClient.devnet();
    const result = await client.getPurchaseQuote("pubkey123", 100);
    expect(result).toEqual(purchaseQuoteData);
  });

  it("calls POST /api/guest/purchase/quote", async () => {
    mockFetch(purchaseQuoteData);
    const client = TxOddsClient.devnet();
    await client.getPurchaseQuote("pubkey123", 100);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/guest/purchase/quote`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
        body: JSON.stringify({ buyerPubkey: "pubkey123", txlineAmount: 100 }),
      })
    );
  });

  it("returns data matching PurchaseQuoteResponse type", async () => {
    mockFetch(purchaseQuoteData);
    const client = TxOddsClient.devnet();
    const result = await client.getPurchaseQuote("pubkey123", 100);
    expect(isPurchaseQuoteResponse(result)).toBe(true);
  });

  it("throws on non-ok response", async () => {
    mockFetchError(400, "Bad Request");
    const client = TxOddsClient.devnet();
    await expect(client.getPurchaseQuote("pubkey123", 100)).rejects.toThrow(
      "TxODDS API 400 on /guest/purchase/quote: Bad Request"
    );
  });
});

describe("authenticate", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns JWT token from response", async () => {
    mockFetch({ token: "test-jwt" });
    const client = TxOddsClient.devnet();
    const token = await client.authenticate();
    expect(token).toBe("test-jwt");
  });

  it("calls POST /auth/guest/start on apiHost (not apiBase)", async () => {
    mockFetch({ token: "test-jwt" });
    const client = TxOddsClient.devnet();
    await client.authenticate();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_HOST}/auth/guest/start`,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("sets _jwt on the client", async () => {
    mockFetch({ token: "test-jwt" });
    const client = TxOddsClient.devnet();
    expect(client.jwt).toBeNull();
    await client.authenticate();
    expect(client.jwt).toBe("test-jwt");
  });

  it("throws on non-ok response", async () => {
    mockFetchError(401, "Unauthorized");
    const client = TxOddsClient.devnet();
    await expect(client.authenticate()).rejects.toThrow(
      "Guest auth failed: 401 Unauthorized"
    );
  });
});

describe("activateToken", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns api token from JSON response", async () => {
    mockFetch({ token: "api-token-json" });
    const client = TxOddsClient.devnet();
    client.setJwt("test-jwt");
    const result = await client.activateToken("tx-sig", "wallet-sig", [1, 2]);
    expect(result).toBe("api-token-json");
    expect(client.apiToken).toBe("api-token-json");
  });

  it("falls back to plain text response", async () => {
    mockFetchWithText("api-token-plain");
    const client = TxOddsClient.devnet();
    client.setJwt("test-jwt");
    const result = await client.activateToken("tx-sig", "wallet-sig", [1, 2]);
    expect(result).toBe("api-token-plain");
    expect(client.apiToken).toBe("api-token-plain");
  });

  it("throws if JWT is not set", async () => {
    const client = TxOddsClient.devnet();
    await expect(client.activateToken("tx-sig", "wallet-sig", [1, 2])).rejects.toThrow(
      "JWT not set"
    );
  });

  it("calls POST /api/token/activate with auth headers", async () => {
    mockFetch({ token: "api-token" });
    const client = TxOddsClient.devnet();
    client.setJwt("test-jwt");
    await client.activateToken("tx-sig", "wallet-sig", [1, 2]);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/token/activate`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-jwt",
        }),
        body: JSON.stringify({ txSig: "tx-sig", walletSignature: "wallet-sig", leagues: [1, 2] }),
      })
    );
  });
});

describe("signActivationMessage", () => {
  it("throws if JWT is not set", () => {
    const client = TxOddsClient.devnet();
    const keyPair = nacl.sign.keyPair();
    expect(() => client.signActivationMessage("tx-sig", [1, 2], keyPair.secretKey)).toThrow(
      "JWT not set"
    );
  });

  it("returns a verifiable base64 signature", () => {
    const client = TxOddsClient.devnet();
    client.setJwt("test-jwt");
    const keyPair = nacl.sign.keyPair();
    const sig = client.signActivationMessage("tx-sig", [1, 2, 3], keyPair.secretKey);
    expect(typeof sig).toBe("string");
    expect(sig.length).toBeGreaterThan(0);
    const messageStr = "tx-sig:1,2,3:test-jwt";
    const message = new TextEncoder().encode(messageStr);
    const verified = nacl.sign.detached.verify(message, Buffer.from(sig, "base64"), keyPair.publicKey);
    expect(verified).toBe(true);
  });
});

describe("streamOdds", () => {
  afterEach(() => vi.restoreAllMocks());

  it("yields SSE messages from /api/odds/stream", async () => {
    mockFetchStream(['data: {"fixtureId":1}\n\n', 'data: {"fixtureId":2}\n\n']);
    const client = TxOddsClient.devnet();
    const messages: SseMessage[] = [];
    for await (const msg of client.streamOdds()) {
      messages.push(msg);
    }
    expect(messages).toHaveLength(2);
    expect(TxOddsClient.parseSseData(messages[0].data)).toEqual({ fixtureId: 1 });
    expect(TxOddsClient.parseSseData(messages[1].data)).toEqual({ fixtureId: 2 });
  });

  it("sends correct headers including Accept and Cache-Control", async () => {
    mockFetchStream(['data: test\n\n']);
    const client = TxOddsClient.devnet();
    for await (const _ of client.streamOdds()) { break; }
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/odds/stream`,
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        }),
      })
    );
  });
});

describe("streamScores", () => {
  afterEach(() => vi.restoreAllMocks());

  it("yields SSE messages from /api/scores/stream", async () => {
    mockFetchStream(['data: {"fixtureId":1}\n\n']);
    const client = TxOddsClient.devnet();
    const messages: SseMessage[] = [];
    for await (const msg of client.streamScores()) {
      messages.push(msg);
    }
    expect(messages).toHaveLength(1);
    expect(TxOddsClient.parseSseData(messages[0].data)).toEqual({ fixtureId: 1 });
  });

  it("sends correct headers", async () => {
    mockFetchStream(['data: test\n\n']);
    const client = TxOddsClient.devnet();
    for await (const _ of client.streamScores()) { break; }
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${DEVNET_BASE}/scores/stream`,
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        }),
      })
    );
  });
});
