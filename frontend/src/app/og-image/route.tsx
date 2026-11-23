import { createSocialCardImage } from "@/lib/og-card";

export function GET() {
  const response = createSocialCardImage();
  response.headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
  return response;
}
