/** Amounts are always integers in minor units (cents). */
export type MinorUnits = number;

export type CurrencyCode = "USD";

export type AccountType = "checking" | "savings";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balance: MinorUnits;
  availableBalance: MinorUnits;
  accountNumber: string;
  routingNumber: string;
  apy?: number;
  goal?: { name: string; target: MinorUnits };
}

export type TransactionDirection = "credit" | "debit";

export type TransactionStatus = "completed" | "pending" | "failed";

export type TransactionChannel = "ach" | "wire" | "card" | "internal" | "crypto";

export type TransactionCategory =
  | "income"
  | "transfer"
  | "housing"
  | "groceries"
  | "dining"
  | "transport"
  | "bills"
  | "shopping"
  | "entertainment"
  | "savings"
  | "crypto"
  | "fees";

export interface Transaction {
  id: string;
  accountId: string;
  direction: TransactionDirection;
  amount: MinorUnits;
  fee: MinorUnits;
  currency: CurrencyCode;
  counterparty: string;
  counterpartyDetail?: string;
  narration: string;
  category: TransactionCategory;
  channel: TransactionChannel;
  status: TransactionStatus;
  reference: string;
  createdAt: string;
}

export interface TransactionFilters {
  accountId?: string;
  direction?: TransactionDirection;
  category?: TransactionCategory;
  search?: string;
  limit?: number;
}

export type CardBrand = "visa" | "mastercard";

export interface PaymentCard {
  id: string;
  accountId: string;
  label: string;
  brand: CardBrand;
  kind: "physical" | "virtual";
  cardNumber?: string;
  cvv?: string;
  pin?: string;
  last4: string;
  expiry: string;
  holderName: string;
  frozen: boolean;
  onlinePayments: boolean;
  currency: CurrencyCode;
  monthlyLimit: MinorUnits;
  spentThisMonth: MinorUnits;
}

export type ExternalAccountType = "checking" | "savings";

export interface Recipient {
  id: string;
  name: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: ExternalAccountType;
}

export interface BankLookup {
  routingNumber: string;
  bankName: string;
}

export type TransferMethod = "ach" | "same_day_ach" | "wire";

export interface TransferQuote {
  method: TransferMethod;
  amount: MinorUnits;
  fee: MinorUnits;
  total: MinorUnits;
  arrivesBy: string;
}

export interface TransferRequest {
  fromAccountId: string;
  recipientName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: ExternalAccountType;
  method: TransferMethod;
  amount: MinorUnits;
  memo: string;
  saveRecipient: boolean;
  verificationCode: string;
}

export interface InternalTransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: MinorUnits;
}

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  theme: string;
}

export interface SpendingCategory {
  category: TransactionCategory;
  amount: MinorUnits;
}

export interface MonthSummary {
  currency: CurrencyCode;
  periodLabel: string;
  moneyIn: MinorUnits;
  moneyOut: MinorUnits;
  previousMoneyOut: MinorUnits;
  categories: SpendingCategory[];
}

export interface CashFlowWeek {
  weekStart: string;
  moneyIn: MinorUnits;
  moneyOut: MinorUnits;
}

/** A recurring monthly bill. */
export interface Bill {
  id: string;
  accountId: string;
  payee: string;
  category: TransactionCategory;
  amount: MinorUnits;
  dayOfMonth: number;
  autopay: boolean;
}

export interface UpcomingPayment {
  id: string;
  payee: string;
  category: TransactionCategory;
  amount: MinorUnits;
  dueDate: string;
  autopay: boolean;
}

/* Crypto */

export type CryptoSymbol = "BTC" | "ETH" | "SOL" | "USDC";

export interface CryptoAsset {
  symbol: CryptoSymbol;
  name: string;
  /** USD cents per one whole coin. */
  price: MinorUnits;
  change24h: number;
  /** Quantity held, in whole coins. */
  holding: number;
  /** Average cost per coin in USD cents. */
  averageCost: MinorUnits;
}

/** A coin's public market price (no holdings), for the homepage. */
export interface MarketPrice {
  symbol: CryptoSymbol;
  name: string;
  price: MinorUnits;
  change24h: number;
}

export type PriceRange = "1W" | "1M" | "3M" | "1Y";

/** A dated amount for trend charts. `date` is an ISO timestamp. */
export interface TrendPoint {
  date: string;
  value: MinorUnits;
}

/** End-of-day balance of each account, oldest day first. */
export interface BalanceHistory {
  checking: TrendPoint[];
  savings: TrendPoint[];
}

export interface PricePoint {
  time: string;
  price: MinorUnits;
}

export type TradeSide = "buy" | "sell";

export interface TradeQuote {
  side: TradeSide;
  symbol: CryptoSymbol;
  /** USD amount the customer entered, in cents. */
  amount: MinorUnits;
  fee: MinorUnits;
  price: MinorUnits;
  quantity: number;
}

export interface TradeRequest {
  side: TradeSide;
  symbol: CryptoSymbol;
  amount: MinorUnits;
  accountId: string;
}

/** Site-wide settings the admin controls. `supportEmail` is null until the admin sets one. */
export interface SiteSettings {
  supportEmail: string | null;
}
