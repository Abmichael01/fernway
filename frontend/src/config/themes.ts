export interface AppTheme {
  id: string;
  name: string;
  tagline: string;
  primary: string;
  brand: string;
  accent: string;
  gradient: string;
  previewColors: [string, string, string];
}

export const FERNWAY_GREEN_THEME: AppTheme = {
  id: "emerald-forest",
  name: "Fernway Green",
  tagline: "Unified private banking emerald and forest green",
  primary: "#059669",
  brand: "#065f46",
  accent: "#34d399",
  gradient: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
  previewColors: ["#059669", "#065f46", "#34d399"],
};

export const PREDEFINED_THEMES: AppTheme[] = [FERNWAY_GREEN_THEME];

export const DEFAULT_THEME_ID = FERNWAY_GREEN_THEME.id;

export function getTheme(themeId?: string): AppTheme {
  void themeId;
  return FERNWAY_GREEN_THEME;
}
