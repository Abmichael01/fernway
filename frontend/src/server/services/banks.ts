import "server-only";
import { isValidRoutingNumber } from "@/lib/routing";

/**
 * Routing number → bank name. A subset of the Federal Reserve ABA directory covering the
 * largest US banks; a production build would use the full directory from a data provider.
 */
const DIRECTORY: Record<string, string> = {
  "021000021": "JPMorgan Chase",
  "322271627": "JPMorgan Chase",
  "026009593": "Bank of America",
  "121000358": "Bank of America",
  "121000248": "Wells Fargo",
  "021000089": "Citibank",
  "051405515": "Capital One",
  "056073502": "Capital One",
  "091000022": "U.S. Bank",
  "043000096": "PNC Bank",
  "031101266": "TD Bank",
  "124003116": "Ally Bank",
  "031101279": "The Bancorp Bank",
  "061000104": "Truist",
  "071000013": "JPMorgan Chase",
  "111000614": "JPMorgan Chase",
  "011000138": "Bank of America",
  "063100277": "Bank of America",
  "122000247": "Wells Fargo",
  "322271724": "Charles Schwab Bank",
  "021202337": "Goldman Sachs Bank (Marcus)",
  "124303120": "Discover Bank",
};

export function findBank(routingNumber: string): string | null {
  if (!isValidRoutingNumber(routingNumber)) return null;
  return DIRECTORY[routingNumber] ?? null;
}
