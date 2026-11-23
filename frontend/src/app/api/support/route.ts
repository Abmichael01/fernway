import { NextResponse } from "next/server";
import { getDjangoSessionToken, getPreviewOverrides } from "@/server/auth/session";
import { getSharpToolzApiBases } from "@/server/sharptoolz-api";

export async function GET() {
  const token = await getDjangoSessionToken();
  const preview = await getPreviewOverrides();

  if (!token) {
    if (preview) {
      return NextResponse.json({
        results: [],
        realtime: { enabled: false, key: "", cluster: "" },
      });
    }
    return NextResponse.json({ detail: "Sign in to access banking support." }, { status: 401 });
  }

  for (const apiBase of getSharpToolzApiBases()) {
    try {
      const res = await fetch(`${apiBase}/fernway/client/support/`, {
        cache: "no-store",
        headers: { "X-Fernway-Token": token },
      });
      const body = await res.json().catch(() => ({}));
      return NextResponse.json(body, { status: res.status });
    } catch {
      // Try next configured API base
    }
  }

  return NextResponse.json({ detail: "Support service is temporarily unavailable." }, { status: 503 });
}

export async function POST(request: Request) {
  const token = await getDjangoSessionToken();
  const preview = await getPreviewOverrides();

  if (!token) {
    if (preview) {
      return NextResponse.json(
        { detail: "Create your Lindenway account first to start live support conversations." },
        { status: 400 },
      );
    }
    return NextResponse.json({ detail: "Sign in to contact banking support." }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));

  for (const apiBase of getSharpToolzApiBases()) {
    try {
      const res = await fetch(`${apiBase}/fernway/client/support/`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "X-Fernway-Token": token,
        },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      return NextResponse.json(body, { status: res.status });
    } catch {
      // Try next configured API base
    }
  }

  return NextResponse.json({ detail: "Support service is temporarily unavailable." }, { status: 503 });
}
