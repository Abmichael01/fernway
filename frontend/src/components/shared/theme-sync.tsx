"use client";

import { useEffect } from "react";
import { DEFAULT_THEME_ID } from "@/config/themes";

/**
 * Ensures everyone uses the single unified Fernway Green palette from globals.css
 * and clears any legacy per-user inline theme overrides from earlier sessions.
 */
export function ThemeSync() {
  useEffect(() => {
    const root = document.documentElement;
    root.style.removeProperty("--primary");
    root.style.removeProperty("--brand");
    root.style.removeProperty("--ring");
    root.style.removeProperty("--theme-primary");
    root.style.removeProperty("--theme-gradient");
    root.style.removeProperty("--theme-accent");
    root.setAttribute("data-user-theme", DEFAULT_THEME_ID);
    try {
      localStorage.removeItem("fw_user_theme");
    } catch {
      // Ignore storage restrictions
    }
  }, []);

  return null;
}
