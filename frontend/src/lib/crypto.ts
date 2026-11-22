import type { CryptoAsset } from "@/types/banking";

/** USD cents value of a holding at the current price. */
export function holdingValue(asset: Pick<CryptoAsset, "holding" | "price">): number {
  return Math.round(asset.holding * asset.price);
}

export function formatQuantity(quantity: number, symbol: string): string {
  const digits = symbol === "BTC" ? 6 : symbol === "USDC" ? 2 : 4;
  return `${quantity.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: digits })} ${symbol}`;
}

export function formatPercent(value: number, { signed = true } = {}): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: signed ? "exceptZero" : "auto",
  })
    .format(value)
    .replace("-", "−");
}
