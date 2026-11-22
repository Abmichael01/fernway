CREATE TYPE "public"."crypto_symbol" AS ENUM('BTC', 'ETH', 'SOL', 'USDC');--> statement-breakpoint
CREATE TYPE "public"."external_account_type" AS ENUM('checking', 'savings');--> statement-breakpoint
CREATE TYPE "public"."trade_side" AS ENUM('buy', 'sell');--> statement-breakpoint
CREATE TABLE "crypto_trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_id" uuid NOT NULL,
	"symbol" "crypto_symbol" NOT NULL,
	"side" "trade_side" NOT NULL,
	"quantity" numeric(30, 12) NOT NULL,
	"price" bigint NOT NULL,
	"amount" bigint NOT NULL,
	"fee" bigint NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "crypto_trades_transaction_id_unique" UNIQUE("transaction_id"),
	CONSTRAINT "crypto_trades_quantity_positive" CHECK ("crypto_trades"."quantity" > 0),
	CONSTRAINT "crypto_trades_price_positive" CHECK ("crypto_trades"."price" > 0)
);
--> statement-breakpoint
CREATE TABLE "recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"bank_name" text NOT NULL,
	"routing_number" text NOT NULL,
	"account_number" text NOT NULL,
	"account_type" "external_account_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crypto_wallets" ADD COLUMN IF NOT EXISTS "designated_network" text DEFAULT 'Ethereum' NOT NULL;--> statement-breakpoint
ALTER TABLE "crypto_wallets" ADD COLUMN IF NOT EXISTS "designated_address" text;--> statement-breakpoint
ALTER TABLE "crypto_trades" ADD CONSTRAINT "crypto_trades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_trades" ADD CONSTRAINT "crypto_trades_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipients" ADD CONSTRAINT "recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "crypto_trades_user_time_idx" ON "crypto_trades" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "recipients_user_account_idx" ON "recipients" USING btree ("user_id","routing_number","account_number");