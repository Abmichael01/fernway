import { siteConfig } from "@/config/site";
import type { CurrencyCode, MinorUnits } from "@/types/banking";

const MINOR_PER_MAJOR = 100;

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(
  currency: CurrencyCode,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${currency}:${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(siteConfig.locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      ...options,
    });
    formatterCache.set(key, formatter);
  }
  return formatter;
}

export interface FormatMoneyOptions {
  /** Prefix credits with "+" and debits with "−". */
  signed?: boolean;
  /** Drop the fractional part, e.g. for chart labels. */
  whole?: boolean;
  compact?: boolean;
}

export function formatMoney(
  amount: MinorUnits,
  currency: CurrencyCode,
  { signed = false, whole = false, compact = false }: FormatMoneyOptions = {},
): string {
  const formatter = getFormatter(currency, {
    signDisplay: signed ? "exceptZero" : "auto",
    minimumFractionDigits: whole || compact ? 0 : 2,
    maximumFractionDigits: whole ? 0 : compact ? 1 : 2,
    notation: compact ? "compact" : "standard",
  });
  // Use a true minus sign so figures align with "+" in tabular columns.
  return formatter.format(amount / MINOR_PER_MAJOR).replace("-", "−");
}

export interface MoneyParts {
  sign: string;
  symbol: string;
  whole: string;
  fraction: string;
}

/** Splits a formatted amount so the UI can style symbol, whole and fraction separately. */
export function splitMoney(amount: MinorUnits, currency: CurrencyCode): MoneyParts {
  const parts = getFormatter(currency, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(Math.abs(amount) / MINOR_PER_MAJOR);

  let symbol = "";
  let whole = "";
  let fraction = "";
  for (const part of parts) {
    if (part.type === "currency") symbol = part.value;
    else if (part.type === "integer" || part.type === "group") whole += part.value;
    else if (part.type === "fraction") fraction = part.value;
  }
  return { sign: amount < 0 ? "−" : "", symbol, whole, fraction };
}

/** Converts a user-entered major amount ("12,500.50") to minor units. Returns null when invalid. */
export function parseMajorAmount(input: string): MinorUnits | null {
  const normalised = input.replace(/[,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalised)) return null;
  const [whole, fraction = ""] = normalised.split(".");
  return Number(whole) * MINOR_PER_MAJOR + Number(fraction.padEnd(2, "0"));
}

export function currencySymbol(currency: CurrencyCode): string {
  return splitMoney(0, currency).symbol;
}
