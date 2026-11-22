CREATE TYPE "public"."invest_deposit_status" AS ENUM('pending', 'credited');--> statement-breakpoint
CREATE TYPE "public"."invest_entry_kind" AS ENUM('deposit', 'withdrawal', 'buy', 'sell');--> statement-breakpoint
CREATE TYPE "public"."invest_risk" AS ENUM('conservative', 'balanced', 'growth', 'aggressive');--> statement-breakpoint
CREATE TYPE "public"."invest_withdrawal_status" AS ENUM('requested', 'paid', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TABLE "invest_cash_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "invest_entry_kind" NOT NULL,
	"direction" "transaction_direction" NOT NULL,
	"status" "transaction_status" NOT NULL,
	"amount" bigint NOT NULL,
	"fee" bigint DEFAULT 0 NOT NULL,
	"description" text NOT NULL,
	"reference" text NOT NULL,
	"portfolio_id" uuid,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invest_cash_entries_reference_unique" UNIQUE("reference"),
	CONSTRAINT "invest_cash_amount_positive" CHECK ("invest_cash_entries"."amount" > 0),
	CONSTRAINT "invest_cash_fee_nonnegative" CHECK ("invest_cash_entries"."fee" >= 0)
);
--> statement-breakpoint
CREATE TABLE "invest_deposit_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"symbol" "crypto_symbol" NOT NULL,
	"ticker" text NOT NULL,
	"address_in" text NOT NULL,
	"address_out" text NOT NULL,
	"nonce" text NOT NULL,
	"callback_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invest_deposit_addresses_address_in_unique" UNIQUE("address_in"),
	CONSTRAINT "invest_deposit_addresses_nonce_unique" UNIQUE("nonce")
);
--> statement-breakpoint
CREATE TABLE "invest_deposit_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"symbol" "crypto_symbol" NOT NULL,
	"gateway_uuid" text NOT NULL,
	"txid_in" text DEFAULT '' NOT NULL,
	"txid_out" text DEFAULT '' NOT NULL,
	"value_coin" numeric(30, 12) NOT NULL,
	"fee_coin" numeric(30, 12) DEFAULT '0' NOT NULL,
	"forwarded_coin" numeric(30, 12),
	"confirmations" integer DEFAULT 0 NOT NULL,
	"status" "invest_deposit_status" DEFAULT 'pending' NOT NULL,
	"entry_id" uuid,
	"price" bigint,
	"credited" bigint,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"credited_at" timestamp with time zone,
	CONSTRAINT "invest_deposit_payments_gateway_uuid_unique" UNIQUE("gateway_uuid"),
	CONSTRAINT "invest_deposit_payments_entry_id_unique" UNIQUE("entry_id")
);
--> statement-breakpoint
CREATE TABLE "invest_portfolio_allocations" (
	"portfolio_id" uuid NOT NULL,
	"symbol" "crypto_symbol" NOT NULL,
	"weight_bps" integer NOT NULL,
	CONSTRAINT "invest_allocations_weight_range" CHECK ("invest_portfolio_allocations"."weight_bps" > 0 and "invest_portfolio_allocations"."weight_bps" <= 10000)
);
--> statement-breakpoint
CREATE TABLE "invest_portfolios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"summary" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"risk" "invest_risk" NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invest_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invest_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"deposits_open" boolean DEFAULT false NOT NULL,
	"btc_address" text DEFAULT '' NOT NULL,
	"eth_address" text DEFAULT '' NOT NULL,
	"sol_address" text DEFAULT '' NOT NULL,
	"usdc_address" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	CONSTRAINT "invest_settings_single_row" CHECK ("invest_settings"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "invest_trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entry_id" uuid NOT NULL,
	"portfolio_id" uuid,
	"symbol" "crypto_symbol" NOT NULL,
	"side" "trade_side" NOT NULL,
	"quantity" numeric(30, 12) NOT NULL,
	"price" bigint NOT NULL,
	"amount" bigint NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invest_trades_quantity_positive" CHECK ("invest_trades"."quantity" > 0),
	CONSTRAINT "invest_trades_price_positive" CHECK ("invest_trades"."price" > 0)
);
--> statement-breakpoint
CREATE TABLE "invest_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invest_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "invest_withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"entry_id" uuid NOT NULL,
	"symbol" "crypto_symbol" NOT NULL,
	"network" text NOT NULL,
	"address" text NOT NULL,
	"amount" bigint NOT NULL,
	"status" "invest_withdrawal_status" DEFAULT 'requested' NOT NULL,
	"payout_txid" text,
	"reject_reason" text,
	"decided_by" uuid,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invest_withdrawals_entry_id_unique" UNIQUE("entry_id"),
	CONSTRAINT "invest_withdrawals_amount_positive" CHECK ("invest_withdrawals"."amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "invest_cash_entries" ADD CONSTRAINT "invest_cash_entries_user_id_invest_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."invest_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_cash_entries" ADD CONSTRAINT "invest_cash_entries_portfolio_id_invest_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."invest_portfolios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_deposit_addresses" ADD CONSTRAINT "invest_deposit_addresses_user_id_invest_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."invest_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_deposit_payments" ADD CONSTRAINT "invest_deposit_payments_address_id_invest_deposit_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."invest_deposit_addresses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_deposit_payments" ADD CONSTRAINT "invest_deposit_payments_user_id_invest_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."invest_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_deposit_payments" ADD CONSTRAINT "invest_deposit_payments_entry_id_invest_cash_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."invest_cash_entries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_portfolio_allocations" ADD CONSTRAINT "invest_portfolio_allocations_portfolio_id_invest_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."invest_portfolios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_portfolios" ADD CONSTRAINT "invest_portfolios_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_sessions" ADD CONSTRAINT "invest_sessions_user_id_invest_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."invest_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_settings" ADD CONSTRAINT "invest_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_trades" ADD CONSTRAINT "invest_trades_user_id_invest_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."invest_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_trades" ADD CONSTRAINT "invest_trades_entry_id_invest_cash_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."invest_cash_entries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_trades" ADD CONSTRAINT "invest_trades_portfolio_id_invest_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."invest_portfolios"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_users" ADD CONSTRAINT "invest_users_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_withdrawals" ADD CONSTRAINT "invest_withdrawals_user_id_invest_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."invest_users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_withdrawals" ADD CONSTRAINT "invest_withdrawals_entry_id_invest_cash_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."invest_cash_entries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invest_withdrawals" ADD CONSTRAINT "invest_withdrawals_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invest_cash_user_time_idx" ON "invest_cash_entries" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "invest_deposit_addresses_user_symbol_idx" ON "invest_deposit_addresses" USING btree ("user_id","symbol");--> statement-breakpoint
CREATE INDEX "invest_deposit_payments_user_idx" ON "invest_deposit_payments" USING btree ("user_id","received_at");--> statement-breakpoint
CREATE UNIQUE INDEX "invest_deposit_payments_tx_idx" ON "invest_deposit_payments" USING btree ("address_id","txid_in") WHERE "invest_deposit_payments"."txid_in" <> '';--> statement-breakpoint
CREATE UNIQUE INDEX "invest_allocations_portfolio_symbol_idx" ON "invest_portfolio_allocations" USING btree ("portfolio_id","symbol");--> statement-breakpoint
CREATE INDEX "invest_sessions_user_idx" ON "invest_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invest_trades_user_time_idx" ON "invest_trades" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "invest_trades_entry_idx" ON "invest_trades" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "invest_withdrawals_status_idx" ON "invest_withdrawals" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "invest_withdrawals_user_idx" ON "invest_withdrawals" USING btree ("user_id","created_at");