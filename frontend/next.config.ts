import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Keep the dev tools button clear of the sidebar account menu and the header theme toggle.
  devIndicators: { position: "bottom-right" },
  partialPrefetching: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
