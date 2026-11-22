import type { MinorUnits, TransferMethod, TransferQuote } from "@/types/banking";

/** Fees per transfer speed, in cents. The homepage (`config/marketing.ts`) must quote the same. */
export const TRANSFER_FEES: Record<TransferMethod, MinorUnits> = {
  ach: 0,
  same_day_ach: 200,
  wire: 1_500,
};

export const MIN_TRANSFER: MinorUnits = 100;
export const WIRE_MINIMUM: MinorUnits = 10_000;
/** Largest single transfer ($250,000). */
export const MAX_TRANSFER: MinorUnits = 25_000_000;

function addBusinessDays(start: Date, days: number): Date {
  const date = new Date(start);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) added += 1;
  }
  return date;
}

/** When the money should reach the other bank, in words. */
export function arrivalLabel(method: TransferMethod, now: Date): string {
  if (method === "wire") return "Within a few hours";
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  if (method === "same_day_ach") return isWeekend ? "Next business day" : "Today by 5 p.m. ET";
  const arrives = addBusinessDays(now, 2);
  return `By ${arrives.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`;
}

export function quoteTransfer(method: TransferMethod, amount: MinorUnits, now: Date): TransferQuote {
  const fee = TRANSFER_FEES[method];
  return { method, amount, fee, total: amount + fee, arrivesBy: arrivalLabel(method, now) };
}
