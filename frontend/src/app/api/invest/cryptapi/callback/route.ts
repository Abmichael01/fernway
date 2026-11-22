import { unstable_rethrow } from "next/navigation";
import { parseCallback, verifyCallbackSignature } from "@/server/services/cryptapi";
import { applyDepositCallback } from "@/server/services/invest";

/**
 * CryptAPI deposit callback (POST, form body). Not a browser request, so no CSRF: instead the
 * body must carry CryptAPI's RSA signature, and the URL a nonce we issued for that address.
 * Answering "*ok*" stops CryptAPI's retries; anything else makes it try again later.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const raw = await request.text();
    if (!verifyCallbackSignature(raw, request.headers.get("x-ca-signature"))) {
      return new Response("invalid signature", { status: 401 });
    }
    const nonce = new URL(request.url).searchParams.get("nonce") ?? "";
    const payload = parseCallback(raw);
    if (!nonce || !payload) return new Response("bad request", { status: 400 });

    const outcome = await applyDepositCallback(nonce, payload);
    if (outcome === "unknown") return new Response("unknown address", { status: 404 });
    if (outcome === "retry") return new Response("prices unavailable, retry", { status: 503 });
    return new Response("*ok*", { status: 200, headers: { "content-type": "text/plain" } });
  } catch (error) {
    unstable_rethrow(error);
    console.error("CryptAPI callback failed", error);
    return new Response("error", { status: 500 });
  }
}
