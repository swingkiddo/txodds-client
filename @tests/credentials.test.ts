import { describe, it, expect, beforeEach, afterAll } from "vitest";
import * as fs from "fs";
import * as path from "path";

const tmpHome = `/tmp/txodds-test-${Date.now()}`;
const origHome = process.env.HOME;
process.env.HOME = tmpHome;

import { TxOddsClient } from "../src/client";
const credsFile = path.join(tmpHome, ".txodds", "credentials.json");

describe("credentials persistence", () => {
  beforeEach(() => {
    try { fs.unlinkSync(credsFile); } catch { /* ok */ }
    try { fs.rmdirSync(path.dirname(credsFile)); } catch { /* ok */ }
  });

  afterAll(() => {
    process.env.HOME = origHome;
    try { fs.unlinkSync(credsFile); } catch { /* ok */ }
    try { fs.rmdirSync(path.dirname(credsFile)); } catch { /* ok */ }
    try { fs.rmdirSync(tmpHome); } catch { /* ok */ }
  });

  it("saves credentials to disk after setApiToken", () => {
    const client = TxOddsClient.devnet();
    client.setApiToken("test-token-save");

    expect(fs.existsSync(credsFile)).toBe(true);
    const content = JSON.parse(fs.readFileSync(credsFile, "utf-8"));
    expect(content).toEqual({ apiToken: "test-token-save" });
  });

  it("auto-loads credentials from disk on construction", () => {
    const c1 = TxOddsClient.devnet();
    c1.setApiToken("test-token-load");
    expect(c1.apiToken).toBe("test-token-load");

    const c2 = TxOddsClient.devnet();
    expect(c2.apiToken).toBe("test-token-load");
  });

  it("clearCredentials removes file and resets token", () => {
    const client = TxOddsClient.devnet();
    client.setApiToken("test-token-clear");

    expect(fs.existsSync(credsFile)).toBe(true);
    expect(client.apiToken).toBe("test-token-clear");

    client.clearCredentials();

    expect(fs.existsSync(credsFile)).toBe(false);
    expect(client.apiToken).toBeNull();
  });

  it("constructor silently handles missing credentials file", () => {
    expect(fs.existsSync(credsFile)).toBe(false);
    const client = TxOddsClient.devnet();
    expect(client.apiToken).toBeNull();
  });

  it("constructor silently handles malformed JSON", () => {
    fs.mkdirSync(path.dirname(credsFile), { recursive: true });
    fs.writeFileSync(credsFile, "not-valid-json{", "utf-8");

    const client = TxOddsClient.devnet();
    expect(client.apiToken).toBeNull();
  });

  it("clearCredentials handles missing file gracefully", () => {
    const client = TxOddsClient.devnet();
    expect(fs.existsSync(credsFile)).toBe(false);

    expect(() => client.clearCredentials()).not.toThrow();
    expect(client.apiToken).toBeNull();
  });

  it("apiToken getter returns current token", () => {
    const client = TxOddsClient.devnet();
    expect(client.apiToken).toBeNull();

    client.setApiToken("token-123");
    expect(client.apiToken).toBe("token-123");
  });

  it("credentialsPath returns correct path", () => {
    const client = TxOddsClient.devnet();
    expect(client.credentialsPath).toBe(credsFile);
  });

  it("setApiToken returns this for chaining", () => {
    const client = TxOddsClient.devnet();
    const result = client.setApiToken("test");
    expect(result).toBe(client);
  });

  it("creates .txodds directory if it doesn't exist", () => {
    const dir = path.dirname(credsFile);
    expect(fs.existsSync(dir)).toBe(false);

    const client = TxOddsClient.devnet();
    client.setApiToken("test-token");

    expect(fs.existsSync(dir)).toBe(true);
    expect(fs.existsSync(credsFile)).toBe(true);
  });

  it("sets file permissions to 0o600 on Unix", () => {
    const client = TxOddsClient.devnet();
    client.setApiToken("test-perms");

    if (process.platform !== "win32") {
      const mode = fs.statSync(credsFile).mode;
      expect(mode & 0o077).toBe(0);
    }
  });
});
