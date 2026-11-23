import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/sign-in", "/og-image", "/apple-touch-icon.png", "/icon.svg"],
        disallow: [
          "/api/",
          "/overview",
          "/transactions",
          "/transfers",
          "/cards",
          "/admin",
          "/invest",
          "/vault",
          "/crypto",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
