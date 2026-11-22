/**
 * Local development database: a project-only PostgreSQL cluster in `frontend/.data/pg`,
 * listening on 127.0.0.1:5729 with local trust auth (no password). Start it with `pnpm db:start`.
 * Every other environment must set DATABASE_URL.
 */
export const LOCAL_DATABASE_URL = "postgres://fernway@127.0.0.1:5729/fernway";

export function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (url) return url;
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is not set.");
  }
  return LOCAL_DATABASE_URL;
}
