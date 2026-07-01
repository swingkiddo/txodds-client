# @swingkiddo/txodds-client

TxODDS/TxLINE HTTP + on-chain API client — fixtures, odds, scores, on-chain subscription, and real-time SSE streams. Works with all TxLINE subscription tiers including the free World Cup tier.

## Install

```sh
npm install git+https://github.com/swingkiddo/txodds-client.git
```

No tokens, no `.npmrc`, no registry config needed.

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
| `getFixturesSnapshot(competitionId?)` | `FixtureRecord[]` |
| `getOddsSnapshot(fixtureId)` | `OddsRecord[]` |
| `getOddsUpdatesByTime(epochDay, hourOfDay, interval)` | `OddsRecord[]` |
| `getScoresSnapshot(fixtureId, asOf?)` | `ScoresRecord[]` |
| `getScoresUpdates(fixtureId)` | `ScoresRecord[]` |
| `getScoresUpdatesByTime(epochDay, hourOfDay, interval)` | `ScoresRecord[]` |
| `getScoresHistorical(fixtureId)` | `ScoresRecord[]` |
| `getStatValidation(fixtureId, seq, statKey, statKey2?)` | `StatValidationResult` |

### SSE Streams
| Method | Returns |
|---|---|
| `streamOdds()` | `AsyncGenerator<SseMessage>` |
| `streamScores()` | `AsyncGenerator<SseMessage>` |
| `static parseSseBlock(block)` | `SseMessage \| null` |
| `static readSseMessages(response)` | `AsyncGenerator<SseMessage>` |
| `static parseSseData(data)` | `any` |

## Types

All types are exported and match the actual API response casing:
- `FixtureRecord` — PascalCase (`FixtureId`, `Competition`, `Participant1`, …)
- `OddsRecord` — PascalCase (`SuperOddsType`, `PriceNames`, `Prices`, …)
- `ScoresRecord` — camelCase (`seq`, `ts`, `gameState`, …)
- `StatValidationResult` — camelCase (`statToProve`, `summary`, `subTreeProof`, …)
- `SseMessage` — `{ id?, event?, data, retry? }`

## Dependencies

- `@solana/web3.js` ^1.95 — runtime peer dep
- `@solana/spl-token` ^0.4.9 — Token-2022 ATA derivation
- `tweetnacl` ^1.0.3 — Ed25519 signing for activation
