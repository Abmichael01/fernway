import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { databaseUrl } from "./url";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { fernwayDb?: Database };

/**
 * The shared database handle. Created on first use (not at import), so `next build`
 * never needs a database. Reused across hot reloads in development.
 */
export function db(): Database {
  if (!globalForDb.fernwayDb) {
    const client = postgres(databaseUrl(), { max: 10 });
    globalForDb.fernwayDb = drizzle(client, { schema });
  }
  return globalForDb.fernwayDb;
}
