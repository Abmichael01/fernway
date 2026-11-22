import { describe, expect, it } from "vitest";
import {
  isValidAddress,
  isValidMix,
  mixChange24h,
  QuoteError,
  quoteDirect,
  quotePortfolioBuy,
  quotePortfolioSell,
  splitByWeights,
} from "./invest";

const prices = { BTC: 6_000_000, ETH: 300_000, SOL: 15_000, USDC: 100 };
const mix = [
  { symbol: "BTC" as const, weightBps: 5_000 },
  { symbol: "ETH" as const, weightBps: 3_333 },
  { symbol: "SOL" as const, weightBps: 1_667 },
];

describe("splitByWeights", () => {
  it("always adds up to the amount exactly", () => {
    for (const amount of [1, 99, 1_000, 12_345, 9_999_999]) {
      const legs = splitByWeights(amount, mix);
      expect(legs.reduce((sum, leg) => sum + leg.amount, 0)).toBe(amount);
    }
  });
});

describe("isValidMix", () => {
  it("needs weights summing to 100% with no repeats", () => {
    expect(isValidMix(mix)).toBe(true);
    expect(isValidMix([{ symbol: "BTC", weightBps: 9_999 }])).toBe(false);
    expect(isValidMix([{ symbol: "BTC", weightBps: 5_000 }, { symbol: "BTC", weightBps: 5_000 }])).toBe(false);
    expect(isValidMix([])).toBe(false);
  });
});

describe("quotePortfolioBuy", () => {
  it("takes the fee first and buys the rest by weight at live prices", () => {
    const quote = quotePortfolioBuy(50_000, mix, prices);
    expect(quote.fee).toBe(625); // 1.25%
    expect(quote.net).toBe(49_375);
    expect(quote.legs.reduce((sum, leg) => sum + leg.amount, 0)).toBe(49_375);
    const btc = quote.legs.find((leg) => leg.symbol === "BTC")!;
    expect(btc.quantity).toBeCloseTo(btc.amount / prices.BTC, 12);
  });
});

describe("quotePortfolioSell", () => {
  const holdings = new Map([
    ["BTC" as const, 0.01],
    ["ETH" as const, 0.1],
  ]);

  it("sells every coin in the same proportion", () => {
    // Held value: 60_000 + 30_000 = 90_000 cents.
    const quote = quotePortfolioSell(45_000, holdings, prices);
    expect(quote.legs.find((leg) => leg.symbol === "BTC")!.quantity).toBeCloseTo(0.005, 12);
    expect(quote.legs.find((leg) => leg.symbol === "ETH")!.quantity).toBeCloseTo(0.05, 12);
    expect(quote.amount).toBe(45_000);
    expect(quote.net).toBe(45_000 - 563);
  });

  it("sells exactly what is held for 'all'", () => {
    const quote = quotePortfolioSell("all", holdings, prices);
    expect(quote.legs.find((leg) => leg.symbol === "BTC")!.quantity).toBe(0.01);
    expect(quote.amount).toBe(90_000);
  });

  it("refuses more than is held", () => {
    expect(() => quotePortfolioSell(90_001, holdings, prices)).toThrow(QuoteError);
  });

  it("refuses an empty portfolio", () => {
    expect(() => quotePortfolioSell("all", new Map(), prices)).toThrow(QuoteError);
  });
});

describe("quoteDirect", () => {
  it("refuses selling more coins than held", () => {
    expect(() => quoteDirect("sell", "BTC", 60_001, prices.BTC, 0.01)).toThrow(QuoteError);
    expect(quoteDirect("sell", "BTC", 60_000, prices.BTC, 0.01).legs[0].quantity).toBe(0.01);
  });
});

describe("mixChange24h", () => {
  it("weights each coin's change", () => {
    expect(mixChange24h([{ symbol: "BTC", weightBps: 5_000 }, { symbol: "ETH", weightBps: 5_000 }], { BTC: 0.02, ETH: -0.04, SOL: 0, USDC: 0 })).toBeCloseTo(-0.01, 12);
  });
});

describe("isValidAddress", () => {
  it("matches each network's format", () => {
    expect(isValidAddress("BTC", "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq")).toBe(true);
    expect(isValidAddress("BTC", "0x52908400098527886E0F7030069857D2E4169EE7")).toBe(false);
    expect(isValidAddress("ETH", "0x52908400098527886E0F7030069857D2E4169EE7")).toBe(true);
    expect(isValidAddress("SOL", "4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T")).toBe(true);
    expect(isValidAddress("USDC", "0x52908400098527886E0F7030069857D2E4169EE7")).toBe(true);
    expect(isValidAddress("USDC", "4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T")).toBe(false);
  });
});
