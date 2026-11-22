import { describe, expect, it } from "vitest";
import { positionsFromTrades, quantityAt, quoteTrade, tradeFee, type TradeRecord } from "./trades";

describe("tradeFee", () => {
  it("charges 1.25% with a 99¢ floor", () => {
    expect(tradeFee(1_000)).toBe(99);
    expect(tradeFee(100_000)).toBe(1_250);
  });
});

describe("quoteTrade", () => {
  it("buys coins with the amount after the fee", () => {
    const quote = quoteTrade("buy", "BTC", 100_000, 5_000_000);
    expect(quote.fee).toBe(1_250);
    expect(quote.quantity).toBeCloseTo(98_750 / 5_000_000, 12);
  });

  it("sells coins worth the full amount", () => {
    expect(quoteTrade("sell", "ETH", 50_000, 250_000).quantity).toBeCloseTo(0.2, 12);
  });
});

const at = (day: number) => new Date(2026, 9, day);
const trades: TradeRecord[] = [
  { symbol: "ETH", side: "buy", quantity: 1, amount: 201_000, fee: 1_000, occurredAt: at(1) },
  { symbol: "ETH", side: "buy", quantity: 1, amount: 301_000, fee: 1_000, occurredAt: at(5) },
  { symbol: "ETH", side: "sell", quantity: 0.5, amount: 150_000, fee: 1_875, occurredAt: at(9) },
];

describe("positionsFromTrades", () => {
  it("sums coins and averages the cost of what is still held", () => {
    const { ETH, BTC } = positionsFromTrades(trades);
    expect(ETH.quantity).toBeCloseTo(1.5, 12);
    expect(ETH.averageCost).toBe(250_000); // $2,000 and $3,000 buys; a sale keeps the average
    expect(BTC).toEqual({ quantity: 0, averageCost: 0 });
  });

  it("is zero after selling everything", () => {
    const sold = [...trades, { symbol: "ETH" as const, side: "sell" as const, quantity: 1.5, amount: 1, fee: 0, occurredAt: at(12) }];
    expect(positionsFromTrades(sold).ETH).toEqual({ quantity: 0, averageCost: 0 });
  });
});

describe("quantityAt", () => {
  it("counts only trades up to that moment", () => {
    expect(quantityAt(trades, "ETH", at(3).getTime())).toBe(1);
    expect(quantityAt(trades, "ETH", at(10).getTime())).toBeCloseTo(1.5, 12);
    expect(quantityAt(trades, "ETH", at(0).getTime())).toBe(0);
  });
});
