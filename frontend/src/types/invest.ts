/**
 * Fernway Invest: a separate app with its own customers, sign-in, cash and holdings.
 * Nothing here is shared with Fernway Banking or the Vault except the admin.
 * Money is integer USD cents; coin quantities are floats of whole coins.
 */
import type { CryptoSymbol, MinorUnits, PriceRange, TradeSide, TrendPoint } from "./banking";

export type { CryptoSymbol, PriceRange, TradeSide, TrendPoint };

export type InvestRisk = "conservative" | "balanced" | "growth" | "aggressive";

export interface InvestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}

/** One coin in a managed portfolio's mix. Weights are basis points and add up to 10,000. */
export interface PortfolioAllocation {
  symbol: CryptoSymbol;
  weightBps: number;
}

/** A managed portfolio as customers see it: a fixed mix of real coins the admin chose. */
export interface Portfolio {
  id: string;
  name: string;
  summary: string;
  description: string;
  imageUrl: string;
  risk: InvestRisk;
  autoDailyEnabled: boolean;
  dailyRateBps: number;
  dailyFixedCents: number;
  allocations: PortfolioAllocation[];
  /** Today's 24-hour change of the mix, from real market prices (fraction, e.g. -0.012). */
  change24h: number;
}

/** Coins the customer holds, inside one portfolio or bought directly. */
export interface HoldingLine {
  symbol: CryptoSymbol;
  name: string;
  quantity: number;
  /** USD cents per coin, now. */
  price: MinorUnits;
  value: MinorUnits;
  /** What the coins still held cost, in cents. */
  cost: MinorUnits;
}

export interface PortfolioPosition {
  portfolio: Portfolio;
  value: MinorUnits;
  cost: MinorUnits;
  holdings: HoldingLine[];
}

export interface InvestOverview {
  /** Investing cash that can be spent or withdrawn now (requested withdrawals already taken off). */
  cash: MinorUnits;
  /** Value of everything held now (portfolios plus direct crypto), at live prices. */
  invested: MinorUnits;
  /** Cost of everything still held. invested - cost = gain or loss. */
  cost: MinorUnits;
  total: MinorUnits;
  portfolios: PortfolioPosition[];
  /** Coins bought directly, not through a portfolio. */
  direct: HoldingLine[];
  /** False when prices are the offline fallback (values are approximate and trading is refused). */
  pricesLive: boolean;
}

export interface InvestMarketPrice {
  symbol: CryptoSymbol;
  name: string;
  price: MinorUnits;
  change24h: number;
}

/** Every movement of investing cash. Rows say "Money in" (credit) or "Money out" (debit). */
export type InvestEntryKind = "deposit" | "withdrawal" | "buy" | "sell" | "earning";
export type InvestEntryStatus = "pending" | "completed" | "failed";

export interface InvestTrade {
  symbol: CryptoSymbol;
  side: TradeSide;
  quantity: number;
  price: MinorUnits;
  amount: MinorUnits;
}

export interface InvestTransaction {
  id: string;
  kind: InvestEntryKind;
  direction: "credit" | "debit";
  status: InvestEntryStatus;
  /** Cents that moved, fee excluded. */
  amount: MinorUnits;
  fee: MinorUnits;
  description: string;
  reference: string;
  portfolioName: string | null;
  trades: InvestTrade[];
  occurredAt: string;
}

/** What a buy or sell will do, priced by the server at live prices. */
export interface InvestQuote {
  side: TradeSide;
  /** USD amount the customer entered, in cents. */
  amount: MinorUnits;
  fee: MinorUnits;
  /** amount - fee: what buys coins (buy) or arrives as cash (sell). */
  net: MinorUnits;
  legs: { symbol: CryptoSymbol; amount: MinorUnits; price: MinorUnits; quantity: number }[];
}

/* Deposits (CryptAPI) */

export interface DepositCoin {
  symbol: CryptoSymbol;
  name: string;
  /** e.g. "Bitcoin network", "Solana network". Customers must send on this network only. */
  network: string;
  /** Smallest amount the gateway accepts, in whole coins. Less than this is lost. */
  minimum: number;
  /** Gateway fee as a fraction (0.01 = 1%), taken from each deposit. */
  feeRate: number;
  /** The customer's own deposit address for this coin, once created. */
  address: string | null;
}

export type DepositPaymentStatus = "pending" | "credited";

export interface DepositPayment {
  id: string;
  symbol: CryptoSymbol;
  /** Coins the customer sent. */
  quantity: number;
  /** Coins taken by the gateway. */
  feeQuantity: number;
  txid: string;
  status: DepositPaymentStatus;
  /** Cents credited to investing cash (null until credited). */
  credited: MinorUnits | null;
  /** USD cents per coin used for the credit. */
  price: MinorUnits | null;
  receivedAt: string;
  creditedAt: string | null;
}

export interface InvestDeposits {
  /** False until the admin opens deposits. */
  open: boolean;
  coins: DepositCoin[];
  payments: DepositPayment[];
}

export interface InvestCheckout {
  addressIn: string;
  network: string;
  ticker: string;
  symbol: CryptoSymbol;
  amountUsd: MinorUnits;
  amountCoin: string;
  feeRate: number;
  minimum: number;
  description: string;
}

/* Withdrawals (requested by the customer, paid by hand by the admin) */

export type WithdrawalStatus = "requested" | "paid" | "rejected" | "cancelled";

export interface Withdrawal {
  id: string;
  symbol: CryptoSymbol;
  network: string;
  address: string;
  amount: MinorUnits;
  status: WithdrawalStatus;
  payoutTxid: string | null;
  rejectReason: string | null;
  requestedAt: string;
  decidedAt: string | null;
}

/* Admin */

export interface AdminInvestCustomer extends InvestUser {
  disabled: boolean;
  cash: MinorUnits;
  invested: MinorUnits;
}

export interface AdminInvestCustomerDetail {
  customer: AdminInvestCustomer;
  overview: InvestOverview;
  transactions: InvestTransaction[];
  deposits: DepositPayment[];
  withdrawals: Withdrawal[];
}

export interface AdminPortfolio extends Portfolio {
  published: boolean;
  /** Customers holding anything in it now. */
  investors: number;
  /** Value held in it now, all customers. */
  value: MinorUnits;
  createdAt: string;
}

export interface AdminWithdrawal extends Withdrawal {
  customer: { id: string; name: string; email: string };
  /** Coins to send at today's price, for the admin's reference. Null if prices are down. */
  estimatedQuantity: number | null;
}

export interface AdminDepositPayment extends DepositPayment {
  customer: { id: string; name: string; email: string };
}

export interface InvestSettings {
  depositsOpen: boolean;
  /** The company's own receiving wallet per coin; CryptAPI forwards deposits here. */
  addresses: Record<CryptoSymbol, string>;
  /** Public https URL CryptAPI calls back (from INVEST_PUBLIC_URL). Null if not set. */
  callbackBaseUrl: string | null;
}

export interface AdminInvestStats {
  customers: number;
  cash: MinorUnits;
  invested: MinorUnits;
  pendingWithdrawals: number;
  pendingWithdrawalAmount: MinorUnits;
}
