import "server-only";

const LOCAL_DJANGO_PORTS = ["8137", "8000", "8003"] as const;

function normalizeApiBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

/**
 * Returns ordered SharpToolz Django API base URLs (ending in `/api`).
 * - In production, set `SHARPTOOLZ_API_URL` (e.g. `https://api.sharptoolz.com/api`).
 * - In local development, automatically falls back to local Django ports when unset.
 */
export function getSharpToolzApiBases(): string[] {
  const configured =
    process.env.SHARPTOOLZ_API_URL ||
    process.env.NEXT_PUBLIC_SHARPTOOLZ_API_URL ||
    "";
  const bases: string[] = [];

  for (const part of configured.split(",")) {
    const normalized = normalizeApiBase(part);
    if (normalized && !bases.includes(normalized)) {
      bases.push(normalized);
    }
  }

  if (process.env.NODE_ENV !== "production" || bases.length === 0) {
    for (const port of LOCAL_DJANGO_PORTS) {
      const localUrl = `http://127.0.0.1:${port}/api`;
      if (!bases.includes(localUrl)) {
        bases.push(localUrl);
      }
    }
  }

  return bases;
}
