# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-07-07

### Added

- **API token persistence** — `setApiToken()` now saves the token to `~/.txodds/credentials.json`. Token is auto-loaded on construction. (`src/client.ts`)
- **`clearCredentials()`** — deletes the persisted credentials file and resets the in-memory token. (`src/client.ts`)
- **Runtime type guards** — 31 guard functions (`isFixture`, `isOddsPayload`, `isScores`, etc.) for validating API responses match their TypeScript types. (`@tests/guards.ts`)
- **Test infrastructure** — vitest configured, 158 tests across 4 test files covering guards, SSE parsing, credentials persistence, and all HTTP API methods. (`@tests/`)

### Fixed

- **`parseSseBlock`** — SSE messages with an empty `data` field but valid `event` or `id` fields are no longer incorrectly dropped. Tracks field presence via boolean flags instead of relying on falsy value checks. (`src/client.ts`)
