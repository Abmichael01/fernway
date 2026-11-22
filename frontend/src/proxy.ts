import { type NextRequest, NextResponse } from "next/server";
import { INVEST_ENABLED, VAULT_ENABLED } from "@/config/features";
import { isInSignedInArea } from "@/config/site";

const VAULT_API = /^\/api\/(vault|admin\/vault)(\/|$)|^\/api\/admin\/customers\/[^/]+\/vault(\/|$)/;
const INVEST_API = /^\/api\/(invest|admin\/invest)(\/|$)/;
const INVEST_SESSION_COOKIE = "fw_invest_session";

function isInvestPath(pathname: string): boolean {
  return pathname === "/invest" || pathname.startsWith("/invest/");
}

/**
 * Fernway Invest is a separate app with its own sign-in. Returns a response for Invest
 * requests, or null for everything else.
 */
function investGate(request: NextRequest, url: URL): NextResponse | null {
  const pathname = url.pathname;
  if (!INVEST_ENABLED) {
    if (INVEST_API.test(pathname)) return NextResponse.json({ detail: "Not found." }, { status: 404 });
    if (isInvestPath(pathname)) {
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return null;
  }
  // Its own domain later (invest.example.com): the root serves the Invest app.
  const host = (request.headers.get("host") || "").toLowerCase();
  if (host.startsWith("invest.") && pathname === "/") {
    url.pathname = "/invest";
    return NextResponse.rewrite(url);
  }
  if (!isInvestPath(pathname)) return null;
  if (pathname === "/invest/sign-in" || pathname.startsWith("/invest/sign-in/")) return NextResponse.next();
  if (!request.cookies.has(INVEST_SESSION_COOKIE)) {
    url.pathname = "/invest/sign-in";
    url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

function publicRedirect(request: NextRequest, url: URL): NextResponse {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (host) {
    const proto = forwardedProto || url.protocol.replace(":", "") || "https";
    return NextResponse.redirect(new URL(`${url.pathname}${url.search}`, `${proto}://${host}`));
  }
  return NextResponse.redirect(url);
}

/**
 * Fast gate for signed-in areas & multi-domain routing for Fernway Banking vs Fernway Vault.
 */
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const invest = investGate(request, url);
  if (invest) return invest;

  // The Vault is switched off (see src/config/features.ts): its pages and API do not exist.
  if (!VAULT_ENABLED) {
    if (VAULT_API.test(pathname)) {
      return NextResponse.json({ detail: "Not found." }, { status: 404 });
    }
    if (pathname === "/vault" || pathname.startsWith("/vault/")) {
      url.pathname = "/";
      url.search = "";
      return publicRedirect(request, url);
    }
  } else {
    const host = (request.headers.get("host") || "").toLowerCase();
    const isVaultHost =
      host.startsWith("vault.") ||
      host.startsWith("crypto.") ||
      host.startsWith("wallet.") ||
      url.searchParams.get("app") === "vault";

    // If accessing on vault domain (e.g. vault.localhost:4729)
    if (isVaultHost && pathname === "/") {
      url.pathname = "/vault";
      return NextResponse.rewrite(url);
    }

    // Vault routes are accessible directly (standalone crypto wallet)
    if (pathname.startsWith("/vault")) {
      return NextResponse.next();
    }
  }

  // Sign-up page removed; redirect directly to sign-in
  if (pathname === "/sign-up" || pathname.startsWith("/sign-up/")) {
    url.pathname = "/sign-in";
    url.search = "";
    return publicRedirect(request, url);
  }

  // Support lives in the bottom-right floating widget; redirect legacy /support links
  if (pathname === "/support" || pathname.startsWith("/support/")) {
    url.pathname = "/overview";
    url.search = "";
    return publicRedirect(request, url);
  }

  // Crypto is disabled inside Fernway Banking
  if (pathname === "/crypto" || pathname.startsWith("/crypto/")) {
    url.pathname = "/overview";
    url.search = "";
    return publicRedirect(request, url);
  }

  // Banking protected routes: overview, transactions, transfers, cards, admin
  if (isInSignedInArea(pathname)) {
    const previewParam = url.searchParams.get("preview")?.trim();
    if (previewParam && previewParam.length <= 4096 && /^[A-Za-z0-9_-]+$/.test(previewParam)) {
      const response = NextResponse.next();
      const isProd = process.env.NODE_ENV === "production";
      response.cookies.set("fw_preview_gate", "1", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: 60 * 60,
      });
      if (!request.cookies.has("csrftoken")) {
        response.cookies.set("csrftoken", crypto.randomUUID().replace(/-/g, ""), {
          httpOnly: false,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
          path: "/",
        });
      }
      return response;
    }

    const launchToken = url.searchParams.get("token")?.trim();
    if (launchToken && /^[a-fA-F0-9]{16,128}$/.test(launchToken)) {
      url.searchParams.delete("token");
      const response = publicRedirect(request, url);
      response.cookies.set("fw_session", `django:${launchToken}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
      response.cookies.set("csrftoken", crypto.randomUUID().replace(/-/g, ""), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      return response;
    }

    if (!request.cookies.has("fw_session") && !request.cookies.has("fw_preview_gate")) {
      url.pathname = "/sign-in";
      url.search = `?next=${encodeURIComponent(pathname + url.search)}`;
      return publicRedirect(request, url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/overview/:path*",
    "/transactions/:path*",
    "/transfers/:path*",
    "/cards/:path*",
    "/support/:path*",
    "/support",
    "/crypto/:path*",
    "/sign-up/:path*",
    "/sign-up",
    "/vault/:path*",
    "/admin/:path*",
    "/api/vault/:path*",
    "/api/admin/vault/:path*",
    "/api/admin/customers/:id/vault/:path*",
    "/invest/:path*",
    "/invest",
    "/api/invest/:path*",
    "/api/admin/invest/:path*",
  ],
};
