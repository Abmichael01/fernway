import type { CryptoSymbol } from "@/types/invest";

export const COIN_COLORS: Record<CryptoSymbol, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  SOL: "#9945ff",
  USDC: "#2775ca",
};

export function formatDate(iso: string, withTime = false): string {
  return new Date(iso).toLocaleString(
    "en-US",
    withTime
      ? { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }
      : { month: "short", day: "numeric", year: "numeric" },
  );
}

export function shorten(value: string, head = 6, tail = 6): string {
  return value.length <= head + tail + 1 ? value : `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** Gain or loss in cents and as a fraction of cost (0 when nothing was spent). */
export function gainLoss(value: number, cost: number) {
  const amount = value - cost;
  return { amount, fraction: cost > 0 ? amount / cost : 0 };
}
