import { ImageResponse } from "next/og";
import { epitrochoidPath } from "@/lib/guilloche";

const MARK_PATH = epitrochoidPath({ R: 20, r: 3, d: 9 });

export function GET() {
  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #064e3b 100%)",
          borderRadius: 38,
        }}
      >
        <svg width="116" height="116" viewBox="-34 -34 68 68" fill="none">
          <path d={MARK_PATH} stroke="#ffffff" strokeWidth="2.1" />
        </svg>
      </div>
    ),
    { width: 180, height: 180 },
  );
  response.headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
  return response;
}
