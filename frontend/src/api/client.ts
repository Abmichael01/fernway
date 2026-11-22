/**
 * HTTP client for the app's own API (Next.js route handlers under /api):
 * session cookie + double-submit CSRF token on unsafe requests.
 * Transfers and crypto still use the in-browser source in `./local` until their endpoints land.
 */

import { PREVIEW_HEADER, PREVIEW_TOKEN_HEADER, readClientPreviewState } from "@/lib/preview";

export const API_BASE_URL = "/api";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Field-level errors keyed by request field name. */
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")[1];
}

/** Returns the CSRF cookie, asking the server to set one first if the browser has none. */
async function ensureCsrfToken(): Promise<string | undefined> {
  const existing = readCookie("csrftoken");
  if (existing) return existing;
  await fetch(`${API_BASE_URL}/auth/csrf`, { credentials: "include" });
  return readCookie("csrftoken");
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, signal }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  const preview = readClientPreviewState();
  if (preview.payload) headers.set(PREVIEW_HEADER, preview.payload);
  if (preview.token) headers.set(PREVIEW_TOKEN_HEADER, preview.token);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (UNSAFE_METHODS.has(method)) {
    const csrf = await ensureCsrfToken();
    if (csrf) headers.set("X-CSRFToken", decodeURIComponent(csrf));
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "include",
    signal,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      detail?: string;
      errors?: Record<string, string>;
    };
    throw new ApiError(
      payload.detail ?? `Request failed with status ${response.status}`,
      response.status,
      payload.errors,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
