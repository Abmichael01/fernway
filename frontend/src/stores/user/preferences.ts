"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PreferencesState {
  hideBalances: boolean;
  toggleHideBalances: () => void;
}

/**
 * Per-device display preferences. Hydration is deferred (see Providers) so the
 * server render and the first client render always match.
 */
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      hideBalances: false,
      toggleHideBalances: () => set((state) => ({ hideBalances: !state.hideBalances })),
    }),
    {
      name: "fernway-preferences",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
