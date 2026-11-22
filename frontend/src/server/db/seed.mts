/**
 * Creates (or updates) the admin login. Run with the env file that holds the credentials:
 *   envsafe run -f .env.local -- pnpm db:seed
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD. Never prints either value.
 * Customers, accounts and transactions are entered by the admin in the app, not seeded.
 */
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hashPassword } from "../auth/password.ts";
import { users } from "./schema.ts";
import { databaseUrl } from "./url.ts";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD must both be set. Nothing was changed.");
  process.exit(1);
}
if (password.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters. Nothing was changed.");
  process.exit(1);
}

const client = postgres(databaseUrl(), { max: 1 });
const db = drizzle(client);

try {
  const passwordHash = await hashPassword(password);
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    await db.update(users).set({ role: "admin", passwordHash, disabledAt: null }).where(eq(users.id, existing.id));
    console.log("Admin login updated.");
  } else {
    await db.insert(users).values({ role: "admin", email, passwordHash, firstName: "Fernway", lastName: "Admin" });
    console.log("Admin login created.");
  }
} finally {
  await client.end();
}
