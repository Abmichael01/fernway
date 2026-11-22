ALTER TABLE "crypto_wallets" DROP CONSTRAINT IF EXISTS "crypto_wallets_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "crypto_wallets" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "crypto_wallets" ADD COLUMN IF NOT EXISTS "email" text;--> statement-breakpoint
ALTER TABLE "crypto_wallets" ADD CONSTRAINT "crypto_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;