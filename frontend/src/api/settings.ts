import type { SiteSettingsValues } from "@/schemas/settings";
import type { SiteSettings } from "@/types/banking";
import { apiRequest } from "./client";

/** Public settings; works signed out. */
export function getSiteSettings(): Promise<SiteSettings> {
  return apiRequest<SiteSettings>("/settings");
}

export function updateSiteSettings(values: SiteSettingsValues): Promise<SiteSettings> {
  return apiRequest<SiteSettings>("/admin/settings", { method: "PATCH", body: values });
}
