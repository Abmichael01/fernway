import type { TransactionCategory } from "@/types/banking";

export const categoryLabels: Record<TransactionCategory, string> = {
  income: "Income",
  transfer: "Transfers",
  housing: "Housing",
  groceries: "Groceries",
  dining: "Dining",
  transport: "Transport",
  bills: "Bills & utilities",
  shopping: "Shopping",
  entertainment: "Entertainment",
  savings: "Savings",
  crypto: "Crypto",
  fees: "Fees",
};
