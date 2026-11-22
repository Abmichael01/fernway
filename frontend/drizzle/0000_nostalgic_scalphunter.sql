CREATE TYPE "public"."account_type" AS ENUM('checking', 'savings');--> statement-breakpoint
CREATE TYPE "public"."card_brand" AS ENUM('visa', 'mastercard');--> statement-breakpoint
CREATE TYPE "public"."card_kind" AS ENUM('physical', 'virtual');--> statement-breakpoint
CREATE TYPE "public"."transaction_category" AS ENUM('income', 'transfer', 'housing', 'groceries', 'dining', 'transport', 'bills', 'shopping', 'entertainment', 'savings', 'crypto', 'fees');--> statement-breakpoint
CREATE TYPE "public"."transaction_channel" AS ENUM('ach', 'wire', 'card', 'internal', 'crypto');--> statement-breakpoint
CREATE TYPE "public"."transaction_direction" AS ENUM('credit', 'debit');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('completed', 'pending', 'failed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "account_type" NOT NULL,
	"name" text NOT NULL,
	"account_number" text NOT NULL,
	"routing_number" text NOT NULL,
	"apy_bps" integer DEFAULT 0 NOT NULL,
	"goal_name" text,
	"goal_target" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_account_number_unique" UNIQUE("account_number")
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"label" text NOT NULL,
	"kind" "card_kind" NOT NULL,
	"brand" "card_brand" DEFAULT 'visa' NOT NULL,
	"last4" text NOT NULL,
	"expiry" text NOT NULL,
	"holder_name" text NOT NULL,
	"frozen" boolean DEFAULT false NOT NULL,
	"online_payments" boolean DEFAULT true NOT NULL,
	"monthly_limit" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"direction" "transaction_direction" NOT NULL,
	"amount" bigint NOT NULL,
	"fee" bigint DEFAULT 0 NOT NULL,
	"counterparty" text NOT NULL,
	"counterparty_detail" text,
	"narration" text DEFAULT '' NOT NULL,
	"category" "transaction_category" NOT NULL,
	"channel" "transaction_channel" NOT NULL,
	"status" "transaction_status" DEFAULT 'completed' NOT NULL,
	"reference" text NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"entered_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_reference_unique" UNIQUE("reference"),
	CONSTRAINT "transactions_amount_positive" CHECK ("transactions"."amount" > 0),
	CONSTRAINT "transactions_fee_non_negative" CHECK ("transactions"."fee" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"address_line1" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"state" text DEFAULT '' NOT NULL,
	"postal_code" text DEFAULT '' NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_entered_by_users_id_fk" FOREIGN KEY ("entered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cards_user_idx" ON "cards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_account_time_idx" ON "transactions" USING btree ("account_id","occurred_at");