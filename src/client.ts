import {
  PublicKey,
  Connection,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import nacl from "tweetnacl";
import { TXODDS_CONFIG, SUBSCRIBE_DISCRIMINATOR, PDA_SEEDS, NetworkConfig } from "./config";
import {
  Fixture,
  OddsPayload,
  Scores,
  ScoresStatValidation,
  FixtureValidation,
  FixtureBatchValidation,
  OddsValidation,
  PurchaseQuoteResponse,
  SseMessage,
  SubscribeAccounts,
} from "./types";
import fs from "fs";
import path from "path";
import os from "os";

export class TxOddsClient {
  readonly apiHost: string;
  readonly apiBase: string;
  readonly config: NetworkConfig;
  private _jwt: string | null = null;
  private _apiToken: string | null = null;
  readonly credentialsPath: string;

  constructor(apiHost: string);
  constructor(networkOrHost: string) {
    if (networkOrHost in TXODDS_CONFIG) {
      this.config = TXODDS_CONFIG[networkOrHost as "mainnet" | "devnet"];
      this.apiHost = this.config.apiHost;
    } else {
      const host = networkOrHost.replace(/\/+$/, "");
      this.apiHost = host;
      const found = Object.values(TXODDS_CONFIG).find((c) => c.apiHost === host);
      this.config = found ?? {
        apiHost: host,
        programId: PublicKey.default,
        txlTokenMint: PublicKey.default,
        usdtMint: PublicKey.default,
      };
    }
    this.apiBase = `${this.apiHost}/api`;
    this.credentialsPath = path.join(os.homedir(), ".txodds", "credentials.json");
    this._loadCredentials();
  }

  private _loadCredentials(): void {
    try {
      const data = fs.readFileSync(this.credentialsPath, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed.apiToken === "string") {
        this._apiToken = parsed.apiToken;
      }
    } catch {
      // File doesn't exist, unreadable, or malformed — continue silently
    }
  }

  static forNetwork(network: "mainnet" | "devnet"): TxOddsClient {
    return new TxOddsClient(network);
  }

  static mainnet(): TxOddsClient {
    return TxOddsClient.forNetwork("mainnet");
  }

  static devnet(): TxOddsClient {
    return TxOddsClient.forNetwork("devnet");
  }

  get jwt(): string | null {
    return this._jwt;
  }

  get apiToken(): string | null {
    return this._apiToken;
  }

  setJwt(jwt: string): this {
    this._jwt = jwt;
    return this;
  }

  setApiToken(token: string): this {
    this._apiToken = token;
    return this;
  }

  async authenticate(): Promise<string> {
    const res = await fetch(`${this.apiHost}/auth/guest/start`, {
      method: "POST",
    });
    if (!res.ok) {
      throw new Error(`Guest auth failed: ${res.status} ${await res.text()}`);
    }
    const body = await res.json();
    this._jwt = body.token as string;
    return this._jwt;
  }

  static deriveSubscribeAccounts(
    userPubkey: PublicKey,
    config: Pick<NetworkConfig, "programId" | "txlTokenMint">
  ): SubscribeAccounts {
    const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.TOKEN_TREASURY_V2)],
      config.programId
    );
    const tokenTreasuryVault = getAssociatedTokenAddressSync(
      config.txlTokenMint,
      tokenTreasuryPda,
      true,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const [pricingMatrixPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(PDA_SEEDS.PRICING_MATRIX)],
      config.programId
    );
    const userTokenAccount = getAssociatedTokenAddressSync(
      config.txlTokenMint,
      userPubkey,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return {
      user: userPubkey,
      pricingMatrix: pricingMatrixPda,
      tokenMint: config.txlTokenMint,
      userTokenAccount,
      tokenTreasuryVault,
      tokenTreasuryPda,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    };
  }

  buildSubscribeInstruction(
    accounts: SubscribeAccounts,
    serviceLevelId: number,
    weeks: number
  ): TransactionInstruction {
    const discriminator = new Uint8Array(SUBSCRIBE_DISCRIMINATOR);
    const serviceLevelBuf = new Uint8Array(2);
    serviceLevelBuf[0] = serviceLevelId & 0xff;
    serviceLevelBuf[1] = (serviceLevelId >> 8) & 0xff;
    const weeksBuf = new Uint8Array([weeks]);
    const data = new Uint8Array([...discriminator, ...serviceLevelBuf, ...weeksBuf]);

    const keys = [
      { pubkey: accounts.user, isSigner: true, isWritable: true },
      { pubkey: accounts.pricingMatrix, isSigner: false, isWritable: true },
      { pubkey: accounts.tokenMint, isSigner: false, isWritable: false },
      { pubkey: accounts.userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: accounts.tokenTreasuryVault, isSigner: false, isWritable: true },
      { pubkey: accounts.tokenTreasuryPda, isSigner: false, isWritable: true },
      { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
      { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
      { pubkey: accounts.associatedTokenProgram, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
      programId: this.config.programId,
      keys,
      data: Buffer.from(data),
    });
  }

  buildSubscribeTransaction(
    accounts: SubscribeAccounts,
    serviceLevelId: number,
    weeks: number
  ): Transaction {
    const ix = this.buildSubscribeInstruction(accounts, serviceLevelId, weeks);
    return new Transaction().add(ix);
  }

  async subscribeWithKeypair(
    keypair: Keypair,
    serviceLevelId: number,
    weeks: number,
    connection: Connection
  ): Promise<string> {
    const accounts = TxOddsClient.deriveSubscribeAccounts(keypair.publicKey, this.config);
    const ix = this.buildSubscribeInstruction(accounts, serviceLevelId, weeks);
    const tx = new Transaction({ feePayer: keypair.publicKey });
    tx.add(ix);
    return sendAndConfirmTransaction(connection, tx, [keypair], {
      commitment: "confirmed",
    });
  }

  signActivationMessage(
    txSig: string,
    leagues: number[],
    secretKey: Uint8Array
  ): string {
    const jwt = this._jwt;
    if (!jwt) throw new Error("JWT not set. Call authenticate() or setJwt() first.");
    const messageStr = `${txSig}:${leagues.join(",")}:${jwt}`;
    const message = new TextEncoder().encode(messageStr);
    const sig = nacl.sign.detached(message, secretKey);
    return Buffer.from(sig).toString("base64");
  }

  async activateToken(
    txSig: string,
    walletSignature: string,
    leagues: number[]
  ): Promise<string> {
    const jwt = this._jwt;
    if (!jwt) throw new Error("JWT not set. Call authenticate() or setJwt() first.");
    const res = await fetch(`${this.apiBase}/token/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ txSig, walletSignature, leagues }),
    });
    if (!res.ok) {
      throw new Error(`Token activation failed: ${res.status} ${await res.text()}`);
    }
    const text = await res.text();
    let token: string;
    try {
      const body = JSON.parse(text);
      token = body.token ?? body;
    } catch {
      token = text;
    }
    this._apiToken = token;
    return token;
  }

  async activate(
    txSig: string,
    leagues: number[],
    secretKey: Uint8Array
  ): Promise<string> {
    if (!this._jwt) {
      await this.authenticate();
    }
    const walletSignature = this.signActivationMessage(txSig, leagues, secretKey);
    return this.activateToken(txSig, walletSignature, leagues);
  }

  private _requestHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this._jwt) headers["Authorization"] = `Bearer ${this._jwt}`;
    if (this._apiToken) headers["X-Api-Token"] = this._apiToken;
    return headers;
  }

  private async _fetch<R = any>(path: string, init?: RequestInit): Promise<R> {
    const url = `${this.apiBase}${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        ...this._requestHeaders(),
        ...init?.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`TxODDS API ${res.status} on ${path}: ${await res.text()}`);
    }
    return res.json();
  }

  async getFixturesSnapshot(competitionId?: number): Promise<Fixture[]> {
    const params = competitionId !== undefined ? `?competitionId=${competitionId}` : "";
    return this._fetch(`/fixtures/snapshot${params}`);
  }

  async getOddsSnapshot(fixtureId: number): Promise<OddsPayload[]> {
    return this._fetch(`/odds/snapshot/${fixtureId}`);
  }

  async getOddsUpdatesByTime(
    epochDay: number,
    hourOfDay: number,
    interval: number
  ): Promise<OddsPayload[]> {
    return this._fetch(`/odds/updates/${epochDay}/${hourOfDay}/${interval}`);
  }

  async getScoresSnapshot(
    fixtureId: number,
    asOf?: number
  ): Promise<Scores[]> {
    const qs = asOf !== undefined ? `?asOf=${asOf}` : "";
    return this._fetch(`/scores/snapshot/${fixtureId}${qs}`);
  }

  async getScoresUpdates(fixtureId: number): Promise<Scores[]> {
    return this._fetch(`/scores/updates/${fixtureId}`);
  }

  async getScoresUpdatesByTime(
    epochDay: number,
    hourOfDay: number,
    interval: number
  ): Promise<Scores[]> {
    return this._fetch(`/scores/updates/${epochDay}/${hourOfDay}/${interval}`);
  }

  async getScoresHistorical(fixtureId: number): Promise<Scores[]> {
    return this._fetch(`/scores/historical/${fixtureId}`);
  }

  async getStatValidation(
    fixtureId: number,
    seq: number,
    statKey: number,
    statKey2?: number
  ): Promise<ScoresStatValidation> {
    let path = `/scores/stat-validation?fixtureId=${fixtureId}&seq=${seq}&statKey=${statKey}`;
    if (statKey2 !== undefined) path += `&statKey2=${statKey2}`;
    return this._fetch(path);
  }

  async getFixturesUpdates(epochDay: number, hourOfDay: number): Promise<Fixture[]> {
    return this._fetch(`/fixtures/updates/${epochDay}/${hourOfDay}`);
  }

  async getFixtureValidation(fixtureId: number, timestamp?: number): Promise<FixtureValidation> {
    let path = `/fixtures/validation?fixtureId=${fixtureId}`;
    if (timestamp !== undefined) path += `&timestamp=${timestamp}`;
    return this._fetch(path);
  }

  async getFixtureBatchValidation(epochDay: number, hourOfDay: number): Promise<FixtureBatchValidation> {
    return this._fetch(`/fixtures/batch-validation?epochDay=${epochDay}&hourOfDay=${hourOfDay}`);
  }

  async getOddsUpdates(fixtureId: number): Promise<OddsPayload[]> {
    return this._fetch(`/odds/updates/${fixtureId}`);
  }

  async getOddsValidation(messageId: string, ts: number): Promise<OddsValidation> {
    return this._fetch(`/odds/validation?messageId=${encodeURIComponent(messageId)}&ts=${ts}`);
  }

  async getPurchaseQuote(buyerPubkey: string, txlineAmount: number): Promise<PurchaseQuoteResponse> {
    const res = await fetch(`${this.apiBase}/guest/purchase/quote`, {
      method: "POST",
      headers: this._requestHeaders(),
      body: JSON.stringify({ buyerPubkey, txlineAmount }),
    });
    if (!res.ok) {
      throw new Error(`TxODDS API ${res.status} on /guest/purchase/quote: ${await res.text()}`);
    }
    return res.json();
  }

  async *streamOdds(): AsyncGenerator<SseMessage> {
    const url = `${this.apiBase}/odds/stream`;
    const res = await fetch(url, {
      headers: {
        ...this._requestHeaders(),
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
    if (!res.ok) {
      throw new Error(`Odds stream failed: ${res.status} ${await res.text()}`);
    }
    yield* TxOddsClient.readSseMessages(res);
  }

  async *streamScores(): AsyncGenerator<SseMessage> {
    const url = `${this.apiBase}/scores/stream`;
    const res = await fetch(url, {
      headers: {
        ...this._requestHeaders(),
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
    if (!res.ok) {
      throw new Error(`Scores stream failed: ${res.status} ${await res.text()}`);
    }
    yield* TxOddsClient.readSseMessages(res);
  }

  static parseSseBlock(block: string): SseMessage | null {
    const message: SseMessage = { data: "" };

    for (const rawLine of block.split(/\r?\n/)) {
      if (!rawLine || rawLine.startsWith(":")) continue;
      const separatorIndex = rawLine.indexOf(":");
      const field = separatorIndex === -1 ? rawLine : rawLine.slice(0, separatorIndex);
      const value =
        separatorIndex === -1
          ? ""
          : rawLine.slice(separatorIndex + 1).replace(/^ /, "");
      if (field === "data") message.data += `${value}\n`;
      if (field === "event") message.event = value;
      if (field === "id") message.id = value;
      if (field === "retry") message.retry = Number(value);
    }

    message.data = message.data.replace(/\n$/, "");
    return message.data || message.event || message.id ? message : null;
  }

  static async *readSseMessages(response: Response): AsyncGenerator<SseMessage> {
    if (!response.body) throw new Error("Stream response has no body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let separator = buffer.match(/\r?\n\r?\n/);
        while (separator?.index !== undefined) {
          const block = buffer.slice(0, separator.index);
          buffer = buffer.slice(separator.index + separator[0].length);
          const message = TxOddsClient.parseSseBlock(block);
          if (message) yield message;
          separator = buffer.match(/\r?\n\r?\n/);
        }
      }

      buffer += decoder.decode();
      const message = TxOddsClient.parseSseBlock(buffer);
      if (message) yield message;
    } finally {
      reader.releaseLock();
    }
  }

  static parseSseData(data: string): any {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
}
