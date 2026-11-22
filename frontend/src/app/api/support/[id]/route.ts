import { NextResponse } from "next/server";
import { getDjangoSessionToken } from "@/server/auth/session";
import { getSharpToolzApiBases } from "@/server/sharptoolz-api";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const token = await getDjangoSessionToken();
  if (!token) {
    return NextResponse.json({ detail: "Sign in to access banking support." }, { status: 401 });
  }
  const { id } = await context.params;

  for (const apiBase of getSharpToolzApiBases()) {
    try {
      const res = await fetch(`${apiBase}/fernway/client/support/${encodeURIComponent(id)}/`, {
        cache: "no-store",
        headers: { "X-Fernway-Token": token },
      });
      const body = await res.json().catch(() => ({}));
      return NextResponse.json(body, { status: res.status });
    } catch {
      // Try next base
    }
  }

  return NextResponse.json({ detail: "Support service is temporarily unavailable." }, { status: 503 });
}
