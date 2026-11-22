/**
 * Fernway database schema (Drizzle, PostgreSQL).
 *
 * Money is always integer cents (`bigint` read as a JS number). An account has no stored
 * balance: its balance is the sum of its ledger (`transactions`), so balances and statements
 * can never disagree.
 *
 * This file must stay free of path aliases and server-only imports so the seed script can
 * load it with plain Node.
 */
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  bigint,
  boolean,
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["customer", "admin"]);
export const accountType = pgEnum("account_type", ["checking", "savings"]);
export const transactionDirection = pgEnum("transaction_direction", ["credit", "debit"]);
export const transactionStatus = pgEnum("transaction_status", ["completed", "pending", "failed"]);
export const transactionChannel = pgEnum("transaction_channel", ["ach", "wire", "card", "internal", "crypto"]);
export const transactionCategory = pgEnum("transaction_category", [
  "income",
  "transfer",
  "housing",
  "groceries",
  "dining",
  "transport",
  "bills",
  "shopping",
  "entertainment",
  "savings",
  "crypto",
  "fees",
]);
export const externalAccountType = pgEnum("external_account_type", ["checking", "savings"]);
export const cryptoSymbol = pgEnum("crypto_symbol", ["BTC", "ETH", "SOL", "USDC"]);
export const tradeSide = pgEnum("trade_side", ["buy", "sell"]);
export const cardKind = pgEnum("card_kind", ["physical", "virtual"]);
export const cardBrand = pgEnum("card_brand", ["visa", "mastercard"]);

const cents = (name: string) => bigint(name, { mode: "number" });
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: userRole("role").notNull().default("customer"),
  /** Stored lower-cased; unique. */
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull().default(""),
  addressLine1: text("address_line1").notNull().default(""),
  city: text("city").notNull().default(""),
  state: text("state").notNull().default(""),
  postalCode: text("postal_code").notNull().default(""),
  /** User-assigned color theme from the 10 predefined themes. */
  theme: text("theme").notNull().default("fernway-ember"),
  /** A disabled user cannot sign in; their data is kept. */
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 of the session token; the token itself lives only in the browser cookie. */
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: accountType("type").notNull(),
    name: text("name").notNull(),
    accountNumber: text("account_number").notNull().unique(),
    routingNumber: text("routing_number").notNull(),
    /** Annual percentage yield in basis points (410 = 4.10%). */
    apyBps: integer("apy_bps").notNull().default(0),
    goalName: text("goal_name"),
    goalTarget: cents("goal_target"),
    createdAt: createdAt(),
  },
  (table) => [index("accounts_user_idx").on(table.userId)],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    direction: transactionDirection("direction").notNull(),
    amount: cents("amount").notNull(),
    fee: cents("fee").notNull().default(0),
    counterparty: text("counterparty").notNull(),
    counterpartyDetail: text("counterparty_detail"),
    narration: text("narration").notNull().default(""),
    category: transactionCategory("category").notNull(),
    channel: transactionChannel("channel").notNull(),
    status: transactionStatus("status").notNull().default("completed"),
    reference: text("reference").notNull().unique(),
    /** The card used, for card payments. Feeds the card's monthly spend. */
    cardId: uuid("card_id").references((): AnyPgColumn => cards.id, { onDelete: "set null" }),
    /** When the money moved, as the customer sees it. */
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    /** Admin who entered it, when entered from the admin. */
    enteredBy: uuid("entered_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (table) => [
    index("transactions_account_time_idx").on(table.accountId, table.occurredAt),
    check("transactions_amount_positive", sql`${table.amount} > 0`),
    check("transactions_fee_non_negative", sql`${table.fee} >= 0`),
  ],
);

export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    kind: cardKind("kind").notNull(),
    brand: cardBrand("brand").notNull().default("visa"),
    last4: text("last4").notNull(),
    /** MM/YY */
    expiry: text("expiry").notNull(),
    holderName: text("holder_name").notNull(),
    frozen: boolean("frozen").notNull().default(false),
    onlinePayments: boolean("online_payments").notNull().default(true),
    monthlyLimit: cents("monthly_limit").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("cards_user_idx").on(table.userId)],
);

/** A recurring bill the customer pays each month, shown under "Upcoming bills". */
export const bills = pgTable(
  "bills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    payee: text("payee").notNull(),
    category: transactionCategory("category").notNull(),
    amount: cents("amount").notNull(),
    /** Day of the month it is due, 1–28 so every month has it. */
    dayOfMonth: integer("day_of_month").notNull(),
    autopay: boolean("autopay").notNull().default(false),
    createdAt: createdAt(),
  },
  (table) => [
    index("bills_user_idx").on(table.userId),
    check("bills_amount_positive", sql`${table.amount} > 0`),
    check("bills_day_range", sql`${table.dayOfMonth} between 1 and 28`),
  ],
);

/** People a customer has sent money to and chose to save. */
export const recipients = pgTable(
  "recipients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    bankName: text("bank_name").notNull(),
    routingNumber: text("routing_number").notNull(),
    accountNumber: text("account_number").notNull(),
    accountType: externalAccountType("account_type").notNull(),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex("recipients_user_account_idx").on(table.userId, table.routingNumber, table.accountNumber)],
);

/**
 * Crypto buys and sells. Holdings are never stored: they are the sum of these trades.
 * Each trade is paired with the cash transaction that paid for it (or received the proceeds);
 * deleting that transaction deletes the trade too, so cash and coins always agree.
 */
export const cryptoTrades = pgTable(
  "crypto_trades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    transactionId: uuid("transaction_id")
      .notNull()
      .unique()
      .references(() => transactions.id, { onDelete: "cascade" }),
    symbol: cryptoSymbol("symbol").notNull(),
    side: tradeSide("side").notNull(),
    /** Whole coins, exact decimal (read as a string). */
    quantity: numeric("quantity", { precision: 30, scale: 12 }).notNull(),
    /** USD cents per coin at the time of the trade. */
    price: cents("price").notNull(),
    /** USD cents: what was spent (buy) or what the coins were worth (sell), fee included. */
    amount: cents("amount").notNull(),
    fee: cents("fee").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (table) => [
    index("crypto_trades_user_time_idx").on(table.userId, table.occurredAt),
    check("crypto_trades_quantity_positive", sql`${table.quantity} > 0`),
    check("crypto_trades_price_positive", sql`${table.price} > 0`),
  ],
);

/**
 * Settings the admin controls for the whole site. Exactly one row (id = 1).
 * A null support email means "not set": the site hides its contact links rather than
 * show an address nobody reads.
 */
export const siteSettings = pgTable(
  "site_settings",
  {
    id: integer("id").primaryKey().default(1),
    supportEmail: text("support_email"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [check("site_settings_single_row", sql`${table.id} = 1`)],
);

export type UserRow = typeof users.$inferSelect;
export type SiteSettingsRow = typeof siteSettings.$inferSelect;
export type RecipientRow = typeof recipients.$inferSelect;
export type CryptoTradeRow = typeof cryptoTrades.$inferSelect;
export type AccountRow = typeof accounts.$inferSelect;
export type TransactionRow = typeof transactions.$inferSelect;
export type CardRow = typeof cards.$inferSelect;
export type BillRow = typeof bills.$inferSelect;

export const cryptoWallets = pgTable(
  "crypto_wallets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    email: text("email"),
    name: text("name").notNull().default("Main Vault Wallet"),
    evmAddress: text("evm_address").notNull(),
    solanaAddress: text("solana_address").notNull(),
    bitcoinAddress: text("bitcoin_address").notNull(),
    designatedNetwork: text("designated_network").notNull().default("Ethereum"),
    designatedAddress: text("designated_address"),
    createdAt: createdAt(),
  },
  (table) => [index("crypto_wallets_user_idx").on(table.userId)],
);

export const cryptoHoldings = pgTable(
  "crypto_holdings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => cryptoWallets.id, { onDelete: "cascade" }),
    symbol: text("symbol").notNull(),
    name: text("name").notNull().default(""),
    network: text("network").notNull(),
    amount: text("amount").notNull().default("0"),
    stakedAmount: text("staked_amount").notNull().default("0"),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("crypto_holdings_wallet_idx").on(table.walletId)],
);

export const cryptoTransactions = pgTable(
  "crypto_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => cryptoWallets.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    symbol: text("symbol").notNull(),
    amount: text("amount").notNull(),
    fee: text("fee").notNull().default("0.0005"),
    counterparty: text("counterparty").notNull().default(""),
    txHash: text("tx_hash").notNull(),
    network: text("network").notNull(),
    status: text("status").notNull().default("completed"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (table) => [index("crypto_transactions_wallet_idx").on(table.walletId)],
);

export const cryptoNfts = pgTable(
  "crypto_nfts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => cryptoWallets.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    collection: text("collection").notNull(),
    tokenId: text("token_id").notNull(),
    imageUrl: text("image_url").notNull(),
    network: text("network").notNull(),
    floorPrice: text("floor_price").notNull(),
    estimatedUsd: integer("estimated_usd").notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [index("crypto_nfts_wallet_idx").on(table.walletId)],
);

export type CryptoWalletRow = typeof cryptoWallets.$inferSelect;
export type CryptoHoldingRow = typeof cryptoHoldings.$inferSelect;
export type CryptoTransactionRow = typeof cryptoTransactions.$inferSelect;
export type CryptoNftRow = typeof cryptoNfts.$inferSelect;

/* ------------------------------------------------------------------------------------------
 * Fernway Invest: a separate app. Its customers, sessions, cash and holdings live only in the
 * invest_* tables and never touch Banking or the Vault. The admin (a `users` row with role
 * "admin") is the only shared identity.
 *
 * Cash is never stored: it is the sum of `invest_cash_entries`. Holdings are never stored: they
 * are the sum of `invest_trades`, each linked to the cash entry that paid for it. Rows that
 * move money are never deleted; customers are disabled, not removed.
 * ---------------------------------------------------------------------------------------- */

export const investEntryKind = pgEnum("invest_entry_kind", ["deposit", "withdrawal", "buy", "sell", "earning"]);
export const investRisk = pgEnum("invest_risk", ["conservative", "balanced", "growth", "aggressive"]);
export const investDepositStatus = pgEnum("invest_deposit_status", ["pending", "credited"]);
export const investWithdrawalStatus = pgEnum("invest_withdrawal_status", ["requested", "paid", "rejected", "cancelled"]);

export const investUsers = pgTable("invest_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Stored lower-cased; unique among Invest customers (independent of banking emails). */
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull().default(""),
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

export const investSessions = pgTable(
  "invest_sessions",
  {
    /** SHA-256 of the session token; the token itself lives only in the browser cookie. */
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => investUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("invest_sessions_user_idx").on(table.userId)],
);

/** Managed portfolios: a fixed mix of real coins chosen by the admin. No return is stored anywhere. */
export const investPortfolios = pgTable("invest_portfolios", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  risk: investRisk("risk").notNull(),
  autoDailyEnabled: boolean("auto_daily_enabled").notNull().default(false),
  /** Daily return in basis points (100 = 1.00% per day on invested principal). */
  dailyRateBps: integer("daily_rate_bps").notNull().default(0),
  /** Fixed daily earning in USD cents regardless of position size or admin profits. */
  dailyFixedCents: integer("daily_fixed_cents").notNull().default(0),
  published: boolean("published").notNull().default(false),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const investPortfolioAllocations = pgTable(
  "invest_portfolio_allocations",
  {
    portfolioId: uuid("portfolio_id")
      .notNull()
      .references(() => investPortfolios.id, { onDelete: "cascade" }),
    symbol: cryptoSymbol("symbol").notNull(),
    /** Basis points; a portfolio's weights add up to 10,000. */
    weightBps: integer("weight_bps").notNull(),
  },
  (table) => [
    uniqueIndex("invest_allocations_portfolio_symbol_idx").on(table.portfolioId, table.symbol),
    check("invest_allocations_weight_range", sql`${table.weightBps} > 0 and ${table.weightBps} <= 10000`),
  ],
);

export const investCashEntries = pgTable(
  "invest_cash_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => investUsers.id, { onDelete: "restrict" }),
    kind: investEntryKind("kind").notNull(),
    direction: transactionDirection("direction").notNull(),
    /** Credits count once completed; debits count unless failed (pending debits are held). */
    status: transactionStatus("status").notNull(),
    /** Cents that moved, fee excluded. */
    amount: cents("amount").notNull(),
    fee: cents("fee").notNull().default(0),
    description: text("description").notNull(),
    reference: text("reference").notNull().unique(),
    portfolioId: uuid("portfolio_id").references(() => investPortfolios.id, { onDelete: "restrict" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (table) => [
    index("invest_cash_user_time_idx").on(table.userId, table.occurredAt),
    check("invest_cash_amount_positive", sql`${table.amount} > 0`),
    check("invest_cash_fee_nonnegative", sql`${table.fee} >= 0`),
  ],
);

export const investTrades = pgTable(
  "invest_trades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => investUsers.id, { onDelete: "restrict" }),
    entryId: uuid("entry_id")
      .notNull()
      .references(() => investCashEntries.id, { onDelete: "restrict" }),
    /** Null for a direct coin trade. */
    portfolioId: uuid("portfolio_id").references(() => investPortfolios.id, { onDelete: "restrict" }),
    symbol: cryptoSymbol("symbol").notNull(),
    side: tradeSide("side").notNull(),
    quantity: numeric("quantity", { precision: 30, scale: 12 }).notNull(),
    /** USD cents per coin at the time of the trade (live market price). */
    price: cents("price").notNull(),
    /** USD cents of coins bought or sold in this leg, fee excluded. */
    amount: cents("amount").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (table) => [
    index("invest_trades_user_time_idx").on(table.userId, table.occurredAt),
    index("invest_trades_entry_idx").on(table.entryId),
    check("invest_trades_quantity_positive", sql`${table.quantity} > 0`),
    check("invest_trades_price_positive", sql`${table.price} > 0`),
  ],
);

/** One CryptAPI deposit address per customer and coin, forwarding to the company wallet. */
export const investDepositAddresses = pgTable(
  "invest_deposit_addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => investUsers.id, { onDelete: "restrict" }),
    symbol: cryptoSymbol("symbol").notNull(),
    ticker: text("ticker").notNull(),
    /** Address the customer pays (created by CryptAPI). */
    addressIn: text("address_in").notNull().unique(),
    /** Company wallet CryptAPI forwards to (fixed per callback URL). */
    addressOut: text("address_out").notNull(),
    /** Random value in the callback URL; callbacks without a known nonce are refused. */
    nonce: text("nonce").notNull().unique(),
    callbackUrl: text("callback_url").notNull(),
    createdAt: createdAt(),
  },
  (table) => [uniqueIndex("invest_deposit_addresses_user_symbol_idx").on(table.userId, table.symbol)],
);

export const investDepositPayments = pgTable(
  "invest_deposit_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    addressId: uuid("address_id")
      .notNull()
      .references(() => investDepositAddresses.id, { onDelete: "restrict" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => investUsers.id, { onDelete: "restrict" }),
    symbol: cryptoSymbol("symbol").notNull(),
    /** CryptAPI's payment id. */
    gatewayUuid: text("gateway_uuid").notNull().unique(),
    txidIn: text("txid_in").notNull().default(""),
    txidOut: text("txid_out").notNull().default(""),
    valueCoin: numeric("value_coin", { precision: 30, scale: 12 }).notNull(),
    feeCoin: numeric("fee_coin", { precision: 30, scale: 12 }).notNull().default("0"),
    forwardedCoin: numeric("forwarded_coin", { precision: 30, scale: 12 }),
    confirmations: integer("confirmations").notNull().default(0),
    status: investDepositStatus("status").notNull().default("pending"),
    entryId: uuid("entry_id")
      .unique()
      .references(() => investCashEntries.id, { onDelete: "restrict" }),
    /** USD cents per coin used for the credit. */
    price: cents("price"),
    credited: cents("credited"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    creditedAt: timestamp("credited_at", { withTimezone: true }),
  },
  (table) => [
    index("invest_deposit_payments_user_idx").on(table.userId, table.receivedAt),
    uniqueIndex("invest_deposit_payments_tx_idx").on(table.addressId, table.txidIn).where(sql`${table.txidIn} <> ''`),
  ],
);

export const investWithdrawals = pgTable(
  "invest_withdrawals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => investUsers.id, { onDelete: "restrict" }),
    /** The held debit: pending while requested, completed when paid, failed when declined or cancelled. */
    entryId: uuid("entry_id")
      .notNull()
      .unique()
      .references(() => investCashEntries.id, { onDelete: "restrict" }),
    symbol: cryptoSymbol("symbol").notNull(),
    network: text("network").notNull(),
    address: text("address").notNull(),
    amount: cents("amount").notNull(),
    status: investWithdrawalStatus("status").notNull().default("requested"),
    payoutTxid: text("payout_txid"),
    rejectReason: text("reject_reason"),
    decidedBy: uuid("decided_by").references(() => users.id, { onDelete: "set null" }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [
    index("invest_withdrawals_status_idx").on(table.status, table.createdAt),
    index("invest_withdrawals_user_idx").on(table.userId, table.createdAt),
    check("invest_withdrawals_amount_positive", sql`${table.amount} > 0`),
  ],
);

/** Invest settings the admin controls. Exactly one row (id = 1). */
export const investSettings = pgTable(
  "invest_settings",
  {
    id: integer("id").primaryKey().default(1),
    depositsOpen: boolean("deposits_open").notNull().default(false),
    btcAddress: text("btc_address").notNull().default(""),
    ethAddress: text("eth_address").notNull().default(""),
    solAddress: text("sol_address").notNull().default(""),
    usdcAddress: text("usdc_address").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [check("invest_settings_single_row", sql`${table.id} = 1`)],
);

export type InvestUserRow = typeof investUsers.$inferSelect;
export type InvestCashEntryRow = typeof investCashEntries.$inferSelect;
export type InvestTradeRow = typeof investTrades.$inferSelect;
export type InvestPortfolioRow = typeof investPortfolios.$inferSelect;
export type InvestDepositAddressRow = typeof investDepositAddresses.$inferSelect;
export type InvestDepositPaymentRow = typeof investDepositPayments.$inferSelect;
export type InvestWithdrawalRow = typeof investWithdrawals.$inferSelect;
export type InvestSettingsRow = typeof investSettings.$inferSelect;
