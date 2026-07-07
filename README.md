# @swingkiddo/txodds-client

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TxODDS/TxLINE HTTP + on-chain API client — fixtures, odds, scores, on-chain subscription, and real-time SSE streams. Works with all TxLINE subscription tiers including the free World Cup tier.

## Install

```sh
npm install @swingkiddo/txodds-client
```

## Quick Start

```ts
import { TxOddsClient } from "@swingkiddo/txodds-client";
import { Connection, Keypair } from "@solana/web3.js";

// Factory: devnet | mainnet
const client = TxOddsClient.devnet();

// 1. Guest auth — no keypair needed
await client.authenticate();

// 2. Subscribe on-chain (World Cup free tier: serviceLevelId=1, 4 weeks)
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const txSig = await client.subscribeWithKeypair(keypair, 1, 4, connection);

// 3. Activate API token — signs + activates in one call
const apiToken = await client.activate(txSig, [], keypair.secretKey);

// 4. Fetch data — headers are set automatically
const fixtures = await client.getFixturesSnapshot();
const odds = await client.getOddsSnapshot(fixtures[0].FixtureId);

// 5. Real-time streams
for await (const msg of client.streamOdds()) {
  console.log(TxOddsClient.parseSseData(msg.data));
}
```

## Authentication Flow

```ts
// 1. Guest auth (no keypair needed)
await client.authenticate();

// 2. Subscribe on-chain (World Cup free tier: serviceLevelId=1, 4 weeks)
const txSig = await client.subscribeWithKeypair(keypair, 1, 4, connection);

// 3. Activate API token (signs + activates in one call)
const apiToken = await client.activate(txSig, [], keypair.secretKey);

// 4. JWT expires after 30 days — re-authenticate before expiry
```

## Constructor

| Signature | Description |
|---|---|
| `TxOddsClient.devnet()` | Devnet config |
| `TxOddsClient.mainnet()` | Mainnet config |
| `new TxOddsClient("https://custom.txodds.com")` | Custom API host |

## Methods

### Auth
| Method | Returns | Description |
|---|---|---|
| `authenticate()` | `string` (JWT) | `POST /auth/guest/start` |
| `setJwt(jwt)` | `this` | Set existing JWT |
| `setApiToken(token)` | `this` | Set existing API token |

### On-chain Subscribe
| Method | Returns | Description |
|---|---|---|
| `deriveSubscribeAccounts(user, config)` | `SubscribeAccounts` | Derive all PDAs and ATAs |
| `buildSubscribeInstruction(accounts, id, weeks)` | `TransactionInstruction` | Raw ix (no Anchor) |
| `subscribeWithKeypair(kp, id, weeks, connection)` | `string` (txSig) | Build, sign, send, confirm |

### Activation
| Method | Returns | Description |
|---|---|---|
| `signActivationMessage(txSig, leagues, secretKey)` | `string` (base64) | Sign `${txSig}:${leagues}:${jwt}` |
| `activateToken(txSig, sig, leagues)` | `string` (apiToken) | `POST /api/token/activate` |
| `activate(txSig, leagues, secretKey)` | `string` (apiToken) | Authenticate + sign + activate |

### REST Data
| Method | Returns |
|---|---|
| `getFixturesSnapshot(competitionId?)` | `Fixture[]` |
| `getFixturesUpdates(epochDay, hourOfDay)` | `Fixture[]` |
| `getOddsSnapshot(fixtureId)` | `OddsPayload[]` |
| `getOddsUpdates(fixtureId)` | `OddsPayload[]` |
| `getOddsUpdatesByTime(epochDay, hourOfDay, interval)` | `OddsPayload[]` |
| `getScoresSnapshot(fixtureId, asOf?)` | `Scores[]` |
| `getScoresUpdates(fixtureId)` | `Scores[]` |
| `getScoresUpdatesByTime(epochDay, hourOfDay, interval)` | `Scores[]` |
| `getScoresHistorical(fixtureId)` | `Scores[]` |
| `getStatValidation(fixtureId, seq, statKey, statKey2?)` | `ScoresStatValidation` |
| `getPurchaseQuote(buyerPubkey, txlineAmount)` | `PurchaseQuoteResponse` |

### Validation
| Method | Returns |
|---|---|
| `getFixtureValidation(fixtureId, timestamp?)` | `FixtureValidation` |
| `getFixtureBatchValidation(epochDay, hourOfDay)` | `FixtureBatchValidation` |
| `getOddsValidation(messageId, ts)` | `OddsValidation` |

### SSE Streams
| Method | Returns |
|---|---|
| `streamOdds()` | `AsyncGenerator<SseMessage>` |
| `streamScores()` | `AsyncGenerator<SseMessage>` |
| `static parseSseBlock(block)` | `SseMessage \| null` |
| `static readSseMessages(response)` | `AsyncGenerator<SseMessage>` |
| `static parseSseData(data)` | `any` |

## Types

All types are exported and match the actual API response casing (PascalCase for data, camelCase for validation).

### Fixture
```ts
{ FixtureId: 18198205, Competition: "World Cup", Participant1: "USA", Participant2: "Belgium", StartTime: 1783382400000, ... }
```

### Odds
```ts
{ FixtureId: 18198205, SuperOddsType: "ASIANHANDICAP_PARTICIPANT_GOALS", Prices: [3596, 1385], Pct: ["27.809", "72.202"], ... }
```

### Scores (Soccer)
```ts
{
  FixtureId: 18198205,
  GameState: "scheduled",
  Clock: { Running: true, Seconds: 5758 },
  Score: {
    Participant1: { H1: { Corners: 3 }, Total: { Goals: 1, Corners: 3 } },
    Participant2: { H2: { Goals: 1, Corners: 5 }, Total: { Goals: 1, Corners: 7 } }
  },
  Stats: { "1001": 0, "6006": 0 }
}
```

### Soccer Types
- `SoccerFixtureClock` — match clock (`Running`, `Seconds`)
- `SoccerScore` — goals, cards, corners per period
- `SoccerTotalScore` — scores by half (H1, HT, H2, ET1, ET2, PE, Total)
- `SoccerFixtureScore` — both participants' total scores
- `SoccerData` — event details (goal, card, substitution, VAR)
- `SoccerPlayerStats` — individual player statistics
- `SoccerFixturePlayerStats` — both teams' player stats

### Validation Types
- `FixtureValidation`, `FixtureBatchValidation` — Merkle proofs for fixtures
- `OddsValidation` — Merkle proofs for odds
- `ScoresStatValidation`, `ScoresStatValidationV2` — Merkle proofs for stats
- `ProofNode` — `{ hash: number[], isRightSibling: boolean }`

### SSE
- `SseMessage` — `{ id?, event?, data, retry? }`

## Dependencies

- `@solana/web3.js` ^1.95 — runtime peer dep
- `@solana/spl-token` ^0.4.9 — Token-2022 ATA derivation
- `tweetnacl` ^1.0.3 — Ed25519 signing for activation
