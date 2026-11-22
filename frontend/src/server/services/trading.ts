import "server-only";
import { formatQuantity } from "@/lib/crypto";
import { formatMoney } from "@/lib/money";
import { CRYPTO_NAMES, quoteTrade } from "@/lib/trades";
import type { AdminTradeInput } from "@/schemas/trade";
import { db } from "@/server/db/client";
import { cryptoTrades, type TransactionRow, transactions } from "@/server/db/schema";
import { HttpError } from "@/server/http";
import type { CryptoSymbol, TradeSide } from "@/types/banking";
import { assertAvailable, assertNotOverdrawn, holdingsOf, lockAccount, lockCryptoFor } from "./ledger";
import { newReference } from "./numbers";
import { getLiveSpotPrices, PricesUnavailableError, priceAt } from "./prices";

/** Live prices or a clear 503, never a made-up price. */
export async function livePrices() {
  try {
    return await getLiveSpotPrices();
  } catch (error) {
    if (error instanceof PricesUnavailableError) throw new HttpError(503, error.message);
    throw error;
  }
}

interface TradeInput {
  side: TradeSide;
  symbol: CryptoSymbol;
  amount: number;
  accountId: string;
}

/**
 * A customer buys or sells at the current market price. The cash side is a ledger transaction
 * on the chosen account; the coin side is a trade row linked to it. Both are written together.
 */
export async function placeTrade(userId: string, input: TradeInput): Promise<TransactionRow> {
  const price = (await livePrices())[input.symbol].price;
  const quote = quoteTrade(input.side, input.symbol, input.amount, price);

  return db().transaction(async (tx) => {
    const account = await lockAccount(tx, input.accountId).catch(() => null);
    if (!account || account.userId !== userId) {
      throw new HttpError(422, "Choose one of your accounts.", { accountId: "Choose one of your accounts." });
    }
    await lockCryptoFor(tx, userId);

    if (input.side === "sell") {
      const held = (await holdingsOf(tx, userId)).get(input.symbol) ?? 0;
      if (quote.quantity > held + 1e-9) {
        throw new HttpError(422, "Not enough to sell.", {
          amount: `You hold ${formatMoney(Math.floor(held * price), "USD")} of ${CRYPTO_NAMES[input.symbol]}.`,
        });
      }
    }

    const [row] = await tx
      .insert(transactions)
      .values({
        accountId: account.id,
        direction: input.side === "buy" ? "debit" : "credit",
        // Buys: amount − fee bought coins, plus the fee = what left the account. Sells: amount − fee arrived.
        amount: input.amount - quote.fee,
        fee: quote.fee,
        counterparty: CRYPTO_NAMES[input.symbol],
        counterpartyDetail: `${formatQuantity(quote.quantity, input.symbol)} at ${formatMoney(price, "USD")}`,
        narration: `${input.side === "buy" ? "Bought" : "Sold"} ${input.symbol}`,
        category: "crypto",
        channel: "crypto",
        status: "completed",
        reference: newReference(),
      })
      .returning();
    await tx.insert(cryptoTrades).values({
      userId,
      transactionId: row.id,
      symbol: input.symbol,
      side: input.side,
      quantity: quote.quantity.toFixed(12),
      price,
      amount: input.amount,
      fee: quote.fee,
      occurredAt: row.occurredAt,
    });
    if (input.side === "buy") {
      await assertAvailable(tx, account.id, (available) => `${account.name} has ${available} available.`, input.amount);
    }
    return row;
  });
}

/**
 * The admin records a past buy for a customer. It is priced at the real market price of that
 * moment (not a price the admin types), and paid from one of the customer's accounts.
 */
export async function recordPastBuy(customerId: string, input: AdminTradeInput, adminId: string): Promise<TransactionRow> {
  const occurredAt = new Date(input.occurredAt);
  let price: number;
  try {
    price = await priceAt(input.symbol, occurredAt);
  } catch (error) {
    if (error instanceof PricesUnavailableError) throw new HttpError(503, error.message);
    throw new HttpError(422, "No price for that date.", {
      occurredAt: error instanceof Error ? error.message : "No price for that date.",
    });
  }
  const quote = quoteTrade("buy", input.symbol, input.amount, price);

  return db().transaction(async (tx) => {
    const account = await lockAccount(tx, input.accountId).catch(() => null);
    if (!account || account.userId !== customerId) {
      throw new HttpError(422, "Choose one of this customer's accounts.", { accountId: "Choose one of this customer's accounts." });
    }
    await lockCryptoFor(tx, customerId);
    const [row] = await tx
      .insert(transactions)
      .values({
        accountId: account.id,
        direction: "debit",
        amount: input.amount - quote.fee,
        fee: quote.fee,
        counterparty: CRYPTO_NAMES[input.symbol],
        counterpartyDetail: `${formatQuantity(quote.quantity, input.symbol)} at ${formatMoney(price, "USD")}`,
        narration: `Bought ${input.symbol}`,
        category: "crypto",
        channel: "crypto",
        status: "completed",
        reference: newReference(),
        occurredAt,
        enteredBy: adminId,
      })
      .returning();
    await tx.insert(cryptoTrades).values({
      userId: customerId,
      transactionId: row.id,
      symbol: input.symbol,
      side: "buy",
      quantity: quote.quantity.toFixed(12),
      price,
      amount: input.amount,
      fee: quote.fee,
      occurredAt,
    });
    await assertNotOverdrawn(tx, account.id, account.name);
    return row;
  });
}
