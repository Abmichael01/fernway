import { NextResponse } from "next/server";
import { getDjangoSessionToken } from "@/server/auth/session";
import { getSharpToolzApiBases } from "@/server/sharptoolz-api";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = await getDjangoSessionToken();
  if (!token) {
    return NextResponse.json({ detail: "Sign in to authorize realtime support." }, { status: 401 });
  }
  const { id } = await context.params;
  const payload = await request.json().catch(() => ({}));

  for (const apiBase of getSharpToolzApiBases()) {
    try {
      const res = await fetch(
        `${apiBase}/fernway/client/support/${encodeURIComponent(id)}/realtime-auth/`,
        {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            "X-Fernway-Token": token,
          },
          body: JSON.stringify(payload),
        },
      );
      const body = await res.json().catch(() => ({}));
      return NextResponse.json(body, { status: res.status });
    } catch {
      // Try next base
    }
  }

  return NextResponse.json({ detail: "Realtime auth unavailable." }, { status: 503 });
}
