import { PublicKey } from "@solana/web3.js";

export interface NetworkConfig {
  apiHost: string;
  programId: PublicKey;
  txlTokenMint: PublicKey;
  usdtMint: PublicKey;
}

export const TXODDS_CONFIG: Record<"mainnet" | "devnet", NetworkConfig> = {
  mainnet: {
    apiHost: "https://txline.txodds.com",
    programId: new PublicKey("9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA"),
    txlTokenMint: new PublicKey("Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL"),
    usdtMint: new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
  },
  devnet: {
    apiHost: "https://txline-dev.txodds.com",
    programId: new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"),
    txlTokenMint: new PublicKey("4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG"),
    usdtMint: new PublicKey("ELWTKspHKCnCfCiCiqYw1EDH77k8VCP74dK9qytG2Ujh"),
  },
};

export const SUBSCRIBE_DISCRIMINATOR = [
  254, 28, 191, 138, 156, 179, 183, 53,
] as const;

export const PDA_SEEDS = {
  TOKEN_TREASURY_V2: "token_treasury_v2",
  PRICING_MATRIX: "pricing_matrix",
  USDT_TREASURY: "usdt_treasury",
  DAILY_SCORES_ROOTS: "daily_scores_roots",
  DAILY_BATCH_ROOTS: "daily_batch_roots",
  TEN_DAILY_FIXTURES_ROOTS: "ten_daily_fixtures_roots",
} as const;
