import "server-only";
import { randomBytes } from "node:crypto";
import { and, eq, or } from "drizzle-orm";
import { formatQuantity } from "@/lib/crypto";
import {
  COIN_NETWORKS,
  CRYPTO_NAMES,
  type InvestQuoteResult,
  QuoteError,
  quoteDirect,
  quotePortfolioBuy,
  quotePortfolioSell,
} from "@/lib/invest";
import { db } from "@/server/db/client";
import {
  type InvestCashEntryRow,
  investCashEntries,
  investDepositAddresses,
  investDepositPayments,
  investPortfolioAllocations,
  investPortfolios,
  investSettings,
  investTrades,
  investWithdrawals,
  type InvestWithdrawalRow,
} from "@/server/db/schema";
import { HttpError } from "@/server/http";
import type { CryptoSymbol, TradeSide } from "@/types/banking";
import type { InvestCheckout } from "@/types/invest";
import { type CallbackPayload, createAddress, publicBaseUrl, tickerInfo } from "./cryptapi";
import type { Tx } from "./ledger";
import { assertCash, holdingsIn, lockInvestor } from "./invest-ledger";
import { newReference } from "./numbers";
import { livePrices } from "./trading";

function spotCents(spot: Awaited<ReturnType<typeof livePrices>>): Record<CryptoSymbol, number> {
  return { BTC: spot.BTC.price, ETH: spot.ETH.price, SOL: spot.SOL.price, USDC: spot.USDC.price };
}

function quoteFailure(error: unknown): never {
  if (error instanceof QuoteError) throw new HttpError(422, error.message, { amount: error.message });
  throw error;
}

async function publishedPortfolio(portfolioId: string, { mustBePublished }: { mustBePublished: boolean }) {
  const [portfolio] = await db().select().from(investPortfolios).where(eq(investPortfolios.id, portfolioId)).limit(1);
  if (!portfolio || (mustBePublished && !portfolio.published)) throw new HttpError(404, "That portfolio isn't available.");
  const allocations = await db()
    .select({ symbol: investPortfolioAllocations.symbol, weightBps: investPortfolioAllocations.weightBps })
    .from(investPortfolioAllocations)
    .where(eq(investPortfolioAllocations.portfolioId, portfolioId));
  return { portfolio, allocations };
}

/* ---------- Quotes ---------- */

export type QuoteTarget = { portfolioId: string } | { symbol: CryptoSymbol };

/** Prices a buy or sell at live prices without writing anything. */
export async function quoteFor(userId: string, side: TradeSide, target: QuoteTarget, amount: number): Promise<InvestQuoteResult> {
  const prices = spotCents(await livePrices());
  try {
    if ("symbol" in target) {
      const held = side === "sell" ? ((await holdingsIn(db(), userId, null)).get(target.symbol) ?? 0) : 0;
      return quoteDirect(side, target.symbol, amount, prices[target.symbol], held);
    }
    const { allocations } = await publishedPortfolio(target.portfolioId, { mustBePublished: side === "buy" });
    if (side === "buy") return quotePortfolioBuy(amount, allocations, prices);
    return quotePortfolioSell(amount, await holdingsIn(db(), userId, target.portfolioId), prices);
  } catch (error) {
    quoteFailure(error);
  }
}

/* ---------- Writes ---------- */

async function writeTrade(
  tx: Tx,
  userId: string,
  quote: InvestQuoteResult,
  entry: { description: string; portfolioId: string | null },
): Promise<InvestCashEntryRow> {
  const [row] = await tx
    .insert(investCashEntries)
    .values({
      userId,
      kind: quote.side,
      direction: quote.side === "buy" ? "debit" : "credit",
      status: "completed",
      // Buy: coins bought + fee = what left cash. Sell: net arrived, fee shown for the record.
      amount: quote.net,
      fee: quote.fee,
      description: entry.description,
      reference: newReference(),
      portfolioId: entry.portfolioId,
    })
    .returning();
  await tx.insert(investTrades).values(
    quote.legs.map((leg) => ({
      userId,
      entryId: row.id,
      portfolioId: entry.portfolioId,
      symbol: leg.symbol,
      side: quote.side,
      quantity: leg.quantity.toFixed(12),
      price: leg.price,
      amount: leg.amount,
      occurredAt: row.occurredAt,
    })),
  );
  return row;
}

/** Puts `amount` cents of investing cash into a published portfolio, bought at live prices. */
export async function investInPortfolio(userId: string, portfolioId: string, amount: number): Promise<InvestCashEntryRow> {
  const prices = spotCents(await livePrices());
  const { portfolio, allocations } = await publishedPortfolio(portfolioId, { mustBePublished: true });
  let quote: InvestQuoteResult;
  try {
    quote = quotePortfolioBuy(amount, allocations, prices);
  } catch (error) {
    quoteFailure(error);
  }
  return db().transaction(async (tx) => {
    await lockInvestor(tx, userId);
    const row = await writeTrade(tx, userId, quote, { description: `Invested in ${portfolio.name}`, portfolioId });
    await assertCash(tx, userId, amount);
    return row;
  });
}

/** Sells `amount` cents' worth (or everything) of what the customer holds in a portfolio, back to cash. */
export async function withdrawFromPortfolio(userId: string, portfolioId: string, amount: number | "all"): Promise<InvestCashEntryRow> {
  const prices = spotCents(await livePrices());
  const { portfolio } = await publishedPortfolio(portfolioId, { mustBePublished: false });
  return db().transaction(async (tx) => {
    await lockInvestor(tx, userId);
    let quote: InvestQuoteResult;
    try {
      quote = quotePortfolioSell(amount, await holdingsIn(tx, userId, portfolioId), prices);
    } catch (error) {
      quoteFailure(error);
    }
    return writeTrade(tx, userId, quote, { description: `Withdrew from ${portfolio.name}`, portfolioId });
  });
}

/** Buys or sells one coin directly with investing cash. */
export async function placeDirectTrade(
  userId: string,
  input: { side: TradeSide; symbol: CryptoSymbol; amount: number },
): Promise<InvestCashEntryRow> {
  const price = (await livePrices())[input.symbol].price;
  return db().transaction(async (tx) => {
    await lockInvestor(tx, userId);
    const held = (await holdingsIn(tx, userId, null)).get(input.symbol) ?? 0;
    let quote: InvestQuoteResult;
    try {
      quote = quoteDirect(input.side, input.symbol, input.amount, price, held);
    } catch (error) {
      quoteFailure(error);
    }
    const leg = quote.legs[0];
    const row = await writeTrade(tx, userId, quote, {
      description: `${input.side === "buy" ? "Bought" : "Sold"} ${formatQuantity(leg.quantity, input.symbol)}`,
      portfolioId: null,
    });
    if (input.side === "buy") await assertCash(tx, userId, input.amount);
    return row;
  });
}

/* ---------- Withdrawals (customer side) ---------- */

/** Holds the amount from cash at once; the admin pays it by hand or declines it. */
export async function requestWithdrawal(
  userId: string,
  input: { symbol: CryptoSymbol; address: string; amount: number },
): Promise<InvestWithdrawalRow> {
  const address = input.address.trim();
  return db().transaction(async (tx) => {
    await lockInvestor(tx, userId);
    const [entry] = await tx
      .insert(investCashEntries)
      .values({
        userId,
        kind: "withdrawal",
        direction: "debit",
        status: "pending",
        amount: input.amount,
        fee: 0,
        description: `Withdrawal in ${CRYPTO_NAMES[input.symbol]} to ${address.slice(0, 6)}…${address.slice(-4)}`,
        reference: newReference(),
      })
      .returning();
    const [withdrawal] = await tx
      .insert(investWithdrawals)
      .values({
        userId,
        entryId: entry.id,
        symbol: input.symbol,
        network: COIN_NETWORKS[input.symbol].network,
        address,
        amount: input.amount,
      })
      .returning();
    await assertCash(tx, userId, input.amount);
    return withdrawal;
  });
}

type Decision =
  | { status: "paid"; txid: string; adminId: string }
  | { status: "rejected"; reason: string; adminId: string }
  | { status: "cancelled"; userId: string };

/**
 * Settles a requested withdrawal. Paid: the held debit completes. Declined or cancelled: the
 * debit fails, so the money is back in cash. Only a "requested" withdrawal can change.
 */
export async function decideWithdrawal(withdrawalId: string, decision: Decision): Promise<InvestWithdrawalRow> {
  return db().transaction(async (tx) => {
    const [current] = await tx.select().from(investWithdrawals).where(eq(investWithdrawals.id, withdrawalId)).limit(1);
    if (!current || (decision.status === "cancelled" && current.userId !== decision.userId)) {
      throw new HttpError(404, "That withdrawal doesn't exist.");
    }
    await lockInvestor(tx, current.userId);
    const [locked] = await tx.select().from(investWithdrawals).where(eq(investWithdrawals.id, withdrawalId)).for("update").limit(1);
    if (locked.status !== "requested") {
      throw new HttpError(409, "This withdrawal has already been settled.");
    }
    const now = new Date();
    const [updated] = await tx
      .update(investWithdrawals)
      .set({
        status: decision.status,
        payoutTxid: decision.status === "paid" ? decision.txid : null,
        rejectReason: decision.status === "rejected" ? decision.reason : null,
        decidedBy: decision.status === "cancelled" ? null : decision.adminId,
        decidedAt: now,
      })
      .where(eq(investWithdrawals.id, withdrawalId))
      .returning();
    await tx
      .update(investCashEntries)
      .set({ status: decision.status === "paid" ? "completed" : "failed" })
      .where(eq(investCashEntries.id, locked.entryId));
    return updated;
  });
}

/* ---------- Deposits ---------- */

export async function investSettingsRow() {
  const [row] = await db().select().from(investSettings).where(eq(investSettings.id, 1)).limit(1);
  return row ?? { id: 1, depositsOpen: false, btcAddress: "", ethAddress: "", solAddress: "", usdcAddress: "", updatedAt: new Date(), updatedBy: null };
}

export function companyAddress(settings: Awaited<ReturnType<typeof investSettingsRow>>, symbol: CryptoSymbol): string {
  return { BTC: settings.btcAddress, ETH: settings.ethAddress, SOL: settings.solAddress, USDC: settings.usdcAddress }[symbol];
}

/** The customer's deposit address for a coin; created at CryptAPI the first time. */
export async function ensureDepositAddress(userId: string, symbol: CryptoSymbol): Promise<void> {
  const [existing] = await db()
    .select({ id: investDepositAddresses.id })
    .from(investDepositAddresses)
    .where(and(eq(investDepositAddresses.userId, userId), eq(investDepositAddresses.symbol, symbol)))
    .limit(1);
  if (existing) return;

  const settings = await investSettingsRow();
  if (!settings.depositsOpen) throw new HttpError(409, "Deposits aren't open yet.");
  const addressOut = companyAddress(settings, symbol);
  if (!addressOut) throw new HttpError(409, `${CRYPTO_NAMES[symbol]} (${COIN_NETWORKS[symbol].network}) address isn't configured yet.`);

  const nonce = randomBytes(24).toString("base64url");
  const base = publicBaseUrl();
  const callbackUrl = base ? `${base}/api/invest/cryptapi/callback?nonce=${nonce}` : `local://${nonce}`;
  let addressIn = addressOut;

  if (base) {
    try {
      const created = await createAddress(symbol, addressOut, callbackUrl);
      addressIn = created.addressIn;
    } catch (error) {
      // If CryptAPI rejects a non-public/local callback or rate limit, still query live tickerInfo and fall back to admin address.
      await tickerInfo(symbol).catch(() => null);
      if (process.env.NODE_ENV === "production") {
        throw new HttpError(503, error instanceof Error ? error.message : "The payment gateway isn't answering right now.");
      }
    }
  } else {
    // Query CryptAPI live info endpoint so every address check hits CryptAPI even before INVEST_PUBLIC_URL is set.
    await tickerInfo(symbol).catch(() => null);
  }

  await db()
    .insert(investDepositAddresses)
    .values({
      userId,
      symbol,
      ticker: COIN_NETWORKS[symbol].ticker,
      addressIn,
      addressOut,
      nonce,
      callbackUrl,
    })
    // Two clicks at once: the first insert wins, the second is a no-op.
    .onConflictDoNothing();
}

/** Triggers a BEP-20 USD (USDC) CryptAPI payment address for buying an investment or coin. */
export async function createBuyCheckout(
  userId: string,
  input: { amount: number; description: string },
): Promise<InvestCheckout> {
  await ensureDepositAddress(userId, "USDC");
  const [address] = await db()
    .select({ addressIn: investDepositAddresses.addressIn })
    .from(investDepositAddresses)
    .where(and(eq(investDepositAddresses.userId, userId), eq(investDepositAddresses.symbol, "USDC")))
    .limit(1);

  if (!address) {
    throw new HttpError(503, "Could not prepare BEP-20 payment address.");
  }

  const info = await tickerInfo("USDC").catch(() => ({ minimum: 1, feeRate: 0.01 }));
  return {
    addressIn: address.addressIn,
    network: COIN_NETWORKS.USDC.network,
    ticker: COIN_NETWORKS.USDC.ticker,
    symbol: "USDC",
    amountUsd: input.amount,
    amountCoin: (input.amount / 100).toFixed(2),
    feeRate: info.feeRate,
    minimum: info.minimum,
    description: input.description,
  };
}

export type CallbackOutcome = "ok" | "unknown" | "retry";

/**
 * Applies a signature-checked CryptAPI callback. Pending: record it. Confirmed: credit investing
 * cash once, at the live price of the coins forwarded to the company wallet. Safe to repeat.
 * Returns "retry" when prices aren't available, so CryptAPI calls again later.
 */
export async function applyDepositCallback(nonce: string, payload: CallbackPayload): Promise<CallbackOutcome> {
  const [address] = await db().select().from(investDepositAddresses).where(eq(investDepositAddresses.nonce, nonce)).limit(1);
  if (!address || address.addressIn !== payload.addressIn || (payload.addressOut && payload.addressOut !== address.addressOut)) {
    return "unknown";
  }

  let price: number | null = null;
  if (!payload.pending) {
    try {
      price = (await livePrices())[address.symbol].price;
    } catch {
      return "retry";
    }
  }

  return db().transaction(async (tx): Promise<CallbackOutcome> => {
    await lockInvestor(tx, address.userId);
    const match = payload.txidIn
      ? or(eq(investDepositPayments.gatewayUuid, payload.uuid), and(eq(investDepositPayments.addressId, address.id), eq(investDepositPayments.txidIn, payload.txidIn)))
      : eq(investDepositPayments.gatewayUuid, payload.uuid);
    let [payment] = await tx.select().from(investDepositPayments).where(match).for("update").limit(1);

    if (!payment) {
      [payment] = await tx
        .insert(investDepositPayments)
        .values({
          addressId: address.id,
          userId: address.userId,
          symbol: address.symbol,
          gatewayUuid: payload.uuid,
          txidIn: payload.txidIn,
          valueCoin: payload.valueCoin,
          feeCoin: payload.feeCoin,
          confirmations: payload.confirmations,
        })
        .returning();
    }
    if (payment.status === "credited") return "ok";

    if (payload.pending || price === null) {
      await tx
        .update(investDepositPayments)
        .set({ confirmations: payload.confirmations, txidIn: payment.txidIn || payload.txidIn, valueCoin: payload.valueCoin })
        .where(eq(investDepositPayments.id, payment.id));
      return "ok";
    }

    // What actually reached the company wallet: forwarded value, else sent minus the gateway fee.
    const forwarded = payload.forwardedCoin ?? String(Math.max(0, Number(payload.valueCoin) - Number(payload.feeCoin)));
    const credited = Math.floor(Number(forwarded) * price);
    let entryId: string | null = null;
    if (credited > 0) {
      const [entry] = await tx
        .insert(investCashEntries)
        .values({
          userId: address.userId,
          kind: "deposit",
          direction: "credit",
          status: "completed",
          amount: credited,
          fee: 0,
          description: `Deposit of ${formatQuantity(Number(payload.valueCoin), address.symbol)}`,
          reference: newReference(),
        })
        .returning();
      entryId = entry.id;
    }
    await tx
      .update(investDepositPayments)
      .set({
        status: "credited",
        txidIn: payload.txidIn || payment.txidIn,
        txidOut: payload.txidOut,
        valueCoin: payload.valueCoin,
        feeCoin: payload.feeCoin,
        forwardedCoin: forwarded,
        confirmations: payload.confirmations,
        entryId,
        price,
        credited,
        creditedAt: new Date(),
      })
      .where(eq(investDepositPayments.id, payment.id));
    return "ok";
  });
}
