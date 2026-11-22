"use client";

import { cn } from "@/lib/utils";
import { type FormatMoneyOptions, formatMoney, splitMoney } from "@/lib/money";
import { usePreferences } from "@/stores/user/preferences";
import type { CurrencyCode, MinorUnits } from "@/types/banking";

const HIDDEN = "••••••";

interface MoneyProps extends FormatMoneyOptions {
  amount: MinorUnits;
  currency: CurrencyCode;
  /** Masked when the customer hides balances. Use for balances, not transaction amounts. */
  sensitive?: boolean;
  className?: string;
}

export function Money({ amount, currency, sensitive = false, className, ...options }: MoneyProps) {
  const hidden = usePreferences((state) => state.hideBalances) && sensitive;
  return (
    <span className={cn("tabular-nums", className)}>
      {hidden ? `${splitMoney(0, currency).symbol}${HIDDEN}` : formatMoney(amount, currency, options)}
    </span>
  );
}

interface MoneyFigureProps {
  amount: MinorUnits;
  currency: CurrencyCode;
  className?: string;
}

/** Large balance figure: expanded whole units with a smaller raised fraction. */
export function MoneyFigure({ amount, currency, className }: MoneyFigureProps) {
  const hidden = usePreferences((state) => state.hideBalances);
  const parts = splitMoney(amount, currency);

  return (
    <span className={cn("inline-flex items-start font-figure tabular-nums", className)}>
      <span className="mt-[0.18em] mr-[0.08em] text-[0.5em] font-medium opacity-70">
        {parts.sign}
        {parts.symbol}
      </span>
      {hidden ? (
        <span aria-label="Balance hidden" className="tracking-widest">
          {HIDDEN}
        </span>
      ) : (
        <>
          <span>{parts.whole}</span>
          <span className="mt-[0.18em] text-[0.45em] font-medium opacity-70">.{parts.fraction}</span>
        </>
      )}
    </span>
  );
}
