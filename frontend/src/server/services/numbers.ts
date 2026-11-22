import { randomInt } from "node:crypto";

/**
 * Default routing number assigned to Fernway accounts.
 */
export const DEFAULT_ROUTING_NUMBER = "072400007";

function digits(length: number): string {
  let out = "";
  for (let index = 0; index < length; index++) out += randomInt(0, 10).toString();
  return out;
}

/** 12-digit account number that does not start with 0. Uniqueness is enforced by the database. */
export function newAccountNumber(): string {
  return `${randomInt(1, 10)}${digits(11)}`;
}

export function newReference(): string {
  return `FW${digits(12)}`;
}

export function newCardLast4(): string {
  return digits(4);
}

/** MM/YY, four years from now. */
export function cardExpiry(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${month}/${String((now.getFullYear() + 4) % 100).padStart(2, "0")}`;
}

const HEX_CHARS = "0123456789abcdef";
const BASE58_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function randomFromCharset(length: number, charset: string): string {
  let out = "";
  for (let i = 0; i < length; i++) out += charset[randomInt(0, charset.length)];
  return out;
}

export function newEvmAddress(): string {
  return `0x${randomFromCharset(40, HEX_CHARS)}`;
}

export function newSolanaAddress(): string {
  return randomFromCharset(44, BASE58_CHARS);
}

export function newBitcoinAddress(): string {
  return `bc1q${randomFromCharset(38, "023456789acdefghjklmnpqrstuvwxyz")}`;
}

export function newTxHash(network = "Ethereum"): string {
  if (network === "Solana") return randomFromCharset(88, BASE58_CHARS);
  return `0x${randomFromCharset(64, HEX_CHARS)}`;
}
