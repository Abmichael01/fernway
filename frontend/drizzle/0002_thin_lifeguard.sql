CREATE TABLE "bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"payee" text NOT NULL,
	"category" "transaction_category" NOT NULL,
	"amount" bigint NOT NULL,
	"day_of_month" integer NOT NULL,
	"autopay" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bills_amount_positive" CHECK ("bills"."amount" > 0),
	CONSTRAINT "bills_day_range" CHECK ("bills"."day_of_month" between 1 and 28)
);
--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bills_user_idx" ON "bills" USING btree ("user_id");