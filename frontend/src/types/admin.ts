import type { Account, Bill, MinorUnits, PaymentCard } from "./banking";

export interface AdminCustomerSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  theme: string;
  disabled: boolean;
  accountCount: number;
  totalBalance: MinorUnits;
  createdAt: string;
}

/** Totals across every customer, for the admin home. Amounts are cents. */
export interface AdminStats {
  customers: number;
  activeCustomers: number;
  accounts: number;
  totalBalance: MinorUnits;
  monthLabel: string;
  moneyInThisMonth: MinorUnits;
  moneyOutThisMonth: MinorUnits;
  transactionsThisMonth: number;
  /** When the most recent transaction was entered, or null if none yet. */
  lastEnteredAt: string | null;
}

export interface AdminCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  disabled: boolean;
  theme: string;
  createdAt: string;
  accounts: Account[];
  cards: PaymentCard[];
  bills: Bill[];
}
