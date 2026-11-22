import { cn } from "@/lib/utils";
import type { CryptoSymbol } from "@/types/banking";

const glyphs: Record<CryptoSymbol, string> = {
  BTC: "₿",
  ETH: "Ξ",
  SOL: "◎",
  USDC: "$",
};

export function CoinIcon({ symbol, className }: { symbol: CryptoSymbol; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full bg-ink font-heading text-base font-bold text-brass",
        className,
      )}
    >
      {glyphs[symbol]}
    </span>
  );
}
