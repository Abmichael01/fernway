import "server-only";
import { createVerify } from "node:crypto";
import { COIN_NETWORKS } from "@/lib/invest";
import type { CryptoSymbol } from "@/types/banking";

/**
 * CryptAPI (https://docs.cryptapi.io): non-custodial crypto payment gateway. It gives each
 * customer a deposit address that forwards to the company wallet and calls us back when a
 * payment arrives. No API key: the callback URL (with its random nonce) identifies the address.
 */

const API = "https://api.cryptapi.io";
const TIMEOUT_MS = 15_000;
const INFO_TTL_MS = 60 * 60_000;

/**
 * CryptAPI's webhook signing key, as published at https://api.cryptapi.io/pubkey/ and in
 * https://docs.cryptapi.io/webhooks/verify-webhook-signature (RSA-SHA256, PKCS#1 v1.5, 1024-bit).
 * Pinned rather than fetched, so a network attacker can't swap it.
 */
export const CRYPTAPI_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3FT0Ym8b3myVxhQW7ESuuu6lo
dGAsUJs4fq+Ey//jm27jQ7HHHDmP1YJO7XE7Jf/0DTEJgcw4EZhJFVwsk6d3+4fy
Bsn0tKeyGMiaE6cVkX0cy6Y85o8zgc/CwZKc0uw6d5siAo++xl2zl+RGMXCELQVE
ox7pp208zTvown577wIDAQAB
-----END PUBLIC KEY-----`;

export class GatewayError extends Error {
  constructor(message = "The payment gateway isn't answering right now. Try again in a few minutes.") {
    super(message);
    this.name = "GatewayError";
  }
}

/**
 * Checks the `x-ca-signature` header. We ask for POST callbacks, so the signed data is the raw
 * request body exactly as received.
 */
export function verifyCallbackSignature(rawBody: string, signatureB64: string | null, publicKey = CRYPTAPI_PUBLIC_KEY): boolean {
  if (!signatureB64) return false;
  try {
    const verifier = createVerify("RSA-SHA256");
    verifier.update(rawBody);
    return verifier.verify(publicKey, Buffer.from(signatureB64, "base64"));
  } catch {
    return false;
  }
}

/** Public https base URL of this app (e.g. https://invest.example.com), or null if not set. */
export function publicBaseUrl(): string | null {
  const raw = process.env.INVEST_PUBLIC_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && process.env.NODE_ENV === "production") return null;
    return url.origin;
  } catch {
    return null;
  }
}

async function getJson<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  } catch {
    throw new GatewayError();
  }
  const body = (await response.json().catch(() => null)) as (T & { status?: string; error?: string }) | null;
  if (!response.ok || !body || body.status === "error") {
    console.error("CryptAPI request failed", path.split("?")[0], response.status, body?.error);
    throw new GatewayError(
      response.status === 400 && body?.error ? `The payment gateway refused the request: ${body.error}` : undefined,
    );
  }
  return body;
}

export interface CreatedAddress {
  addressIn: string;
  addressOut: string;
  minimum: number;
}

/** Asks CryptAPI for a deposit address forwarding to `addressOut`, calling back `callbackUrl` (POST, form body). */
export async function createAddress(symbol: CryptoSymbol, addressOut: string, callbackUrl: string): Promise<CreatedAddress> {
  const params = new URLSearchParams({
    callback: callbackUrl,
    address: addressOut,
    pending: "1",
    post: "1",
    json: "0",
    convert: "0",
    multi_token: "0",
  });
  const data = await getJson<{ address_in?: string; address_out?: string; minimum_transaction_coin?: number | string }>(
    `/${COIN_NETWORKS[symbol].ticker}/create/?${params}`,
  );
  if (!data.address_in) throw new GatewayError();
  if (data.address_out && data.address_out !== addressOut) {
    // CryptAPI fixes address_out per callback URL; a mismatch means the URL was used before.
    throw new GatewayError("The payment gateway returned a different company wallet. Check the Invest settings.");
  }
  return { addressIn: data.address_in, addressOut, minimum: Number(data.minimum_transaction_coin ?? 0) };
}

export interface TickerInfo {
  minimum: number;
  feeRate: number;
}

const shared = globalThis as typeof globalThis & {
  fernwayCryptapiInfo?: Map<string, { value: TickerInfo; fetchedAt: number }>;
};
shared.fernwayCryptapiInfo ??= new Map();
const infoCache = shared.fernwayCryptapiInfo;

/** Minimum deposit and gateway fee for a coin, cached for an hour (last good answer reused on failure). */
export async function tickerInfo(symbol: CryptoSymbol): Promise<TickerInfo> {
  const ticker = COIN_NETWORKS[symbol].ticker;
  const cached = infoCache.get(ticker);
  if (cached && Date.now() - cached.fetchedAt < INFO_TTL_MS) return cached.value;
  try {
    const data = await getJson<{ minimum_transaction_coin?: string | number; fee_percent?: string | number }>(`/${ticker}/info/`);
    const minimum = Number(data.minimum_transaction_coin);
    const feePercent = Number(data.fee_percent);
    if (!Number.isFinite(minimum) || !Number.isFinite(feePercent)) throw new GatewayError();
    const value = { minimum, feeRate: feePercent / 100 };
    infoCache.set(ticker, { value, fetchedAt: Date.now() });
    return value;
  } catch (error) {
    if (cached) return cached.value;
    throw error;
  }
}

/** A callback from CryptAPI, parsed from the form-encoded POST body. */
export interface CallbackPayload {
  uuid: string;
  addressIn: string;
  addressOut: string;
  txidIn: string;
  txidOut: string;
  confirmations: number;
  pending: boolean;
  valueCoin: string;
  feeCoin: string;
  forwardedCoin: string | null;
  coin: string;
}

const DECIMAL = /^\d+(\.\d+)?$/;

/** Returns null when a required field is missing or malformed. */
export function parseCallback(rawBody: string): CallbackPayload | null {
  const form = new URLSearchParams(rawBody);
  const get = (key: string) => form.get(key)?.trim() ?? "";
  const uuid = get("uuid");
  const addressIn = get("address_in");
  const valueCoin = get("value_coin");
  const pending = get("pending");
  if (!uuid || !addressIn || !DECIMAL.test(valueCoin) || Number(valueCoin) <= 0 || (pending !== "0" && pending !== "1")) {
    return null;
  }
  const feeCoin = get("fee_coin");
  const forwarded = get("value_forwarded_coin");
  return {
    uuid,
    addressIn,
    addressOut: get("address_out"),
    txidIn: get("txid_in"),
    txidOut: get("txid_out"),
    confirmations: Number.parseInt(get("confirmations"), 10) || 0,
    pending: pending === "1",
    valueCoin,
    feeCoin: DECIMAL.test(feeCoin) ? feeCoin : "0",
    forwardedCoin: DECIMAL.test(forwarded) && Number(forwarded) > 0 ? forwarded : null,
    coin: get("coin"),
  };
}
