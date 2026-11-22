CREATE TABLE "crypto_holdings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"symbol" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"network" text NOT NULL,
	"amount" text DEFAULT '0' NOT NULL,
	"staked_amount" text DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crypto_nfts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"name" text NOT NULL,
	"collection" text NOT NULL,
	"token_id" text NOT NULL,
	"image_url" text NOT NULL,
	"network" text NOT NULL,
	"floor_price" text NOT NULL,
	"estimated_usd" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crypto_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"type" text NOT NULL,
	"symbol" text NOT NULL,
	"amount" text NOT NULL,
	"fee" text DEFAULT '0.0005' NOT NULL,
	"counterparty" text DEFAULT '' NOT NULL,
	"tx_hash" text NOT NULL,
	"network" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crypto_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text DEFAULT 'Main Vault Wallet' NOT NULL,
	"evm_address" text NOT NULL,
	"solana_address" text NOT NULL,
	"bitcoin_address" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crypto_holdings" ADD CONSTRAINT "crypto_holdings_wallet_id_crypto_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."crypto_wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_nfts" ADD CONSTRAINT "crypto_nfts_wallet_id_crypto_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."crypto_wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_transactions" ADD CONSTRAINT "crypto_transactions_wallet_id_crypto_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."crypto_wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_wallets" ADD CONSTRAINT "crypto_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "crypto_holdings_wallet_idx" ON "crypto_holdings" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "crypto_nfts_wallet_idx" ON "crypto_nfts" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "crypto_transactions_wallet_idx" ON "crypto_transactions" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "crypto_wallets_user_idx" ON "crypto_wallets" USING btree ("user_id");