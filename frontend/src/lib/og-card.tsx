import { ImageResponse } from "next/og";
import { savingsApy } from "@/config/marketing";
import { siteConfig } from "@/config/site";
import { epitrochoidPath } from "@/lib/guilloche";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export const OG_IMAGE_ALT = `${siteConfig.legalName} — Online Banking, High-Yield Savings & Debit Cards`;

const MARK_PATH = epitrochoidPath({ R: 20, r: 3, d: 9 });
const BACKDROP_PATH = epitrochoidPath({ R: 110, r: 9, d: 40 });

export function createSocialCardImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background:
            "radial-gradient(circle at 85% 18%, rgba(16, 185, 129, 0.34), transparent 52%), linear-gradient(135deg, #071913 0%, #0d231c 55%, #064e3b 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle engraved rosette watermark */}
        <svg
          width="540"
          height="540"
          viewBox="-162 -162 324 324"
          fill="none"
          style={{
            position: "absolute",
            right: -120,
            bottom: -140,
            opacity: 0.16,
          }}
        >
          <path d={BACKDROP_PATH} stroke="#6ee7b7" strokeWidth="1.2" />
        </svg>

        {/* Top header bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: "0 10px 30px rgba(5, 150, 105, 0.35)",
              }}
            >
              <svg width="36" height="36" viewBox="-34 -34 68 68" fill="none">
                <path d={MARK_PATH} stroke="#ffffff" strokeWidth="2.1" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {siteConfig.legalName}
              </span>
              <span style={{ fontSize: 15, color: "#a7f3d0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Online Banking
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 20px",
              borderRadius: 999,
              background: "rgba(16, 185, 129, 0.14)",
              border: "1px solid rgba(110, 231, 183, 0.35)",
              color: "#a7f3d0",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            {siteConfig.domain}
          </div>
        </div>

        {/* Center editorial copy */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 880, gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            {"Online Banking, Built Around Your Money."}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              lineHeight: 1.4,
              color: "rgba(255, 255, 255, 0.78)",
            }}
          >
            {`Checking, ${savingsApy} APY high-yield savings, fast bank transfers, and physical Visa debit cards in one secure portal.`}
          </div>
        </div>

        {/* Bottom highlights strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            borderTop: "1px solid rgba(255, 255, 255, 0.14)",
            paddingTop: 26,
          }}
        >
          {[
            { value: `${savingsApy} APY`, label: "High-Yield Savings" },
            { value: "$0", label: "Standard ACH" },
            { value: "Instant", label: "Account Moves" },
            { value: "Visa", label: "Physical Debit Card" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "14px 18px",
                borderRadius: 14,
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <span style={{ fontSize: 28, fontWeight: 700, color: "#6ee7b7" }}>{stat.value}</span>
              <span style={{ fontSize: 16, color: "rgba(255, 255, 255, 0.76)", marginTop: 4 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE },
  );
}
