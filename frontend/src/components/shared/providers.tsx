"use client";

import { type ReactNode, Suspense, useEffect } from "react";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import { isInSignedInArea } from "@/config/site";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePreferences } from "@/stores/user/preferences";
import { ThemeSync } from "./theme-sync";

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    // An expired session inside the app sends the person back to sign in, then here again.
    // On public pages (homepage, sign-in, invitation notice) a 401 just means "signed out".
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!(error instanceof ApiError) || error.status !== 401 || typeof window === "undefined") return;
        const here = window.location.pathname + window.location.search;
        const path = window.location.pathname;
        // Fernway Invest has its own sign-in. Only a 401 from an Invest query means its session ended;
        // banking queries made by shared components (e.g. theme sync) are expected to 401 there.
        if (path === "/invest" || path.startsWith("/invest/")) {
          if (query.queryKey[0] !== "invest" || path.startsWith("/invest/sign-in")) return;
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign(`/invest/sign-in?next=${encodeURIComponent(here)}`);
          return;
        }
        if (isInSignedInArea(path)) {
          // A full load on purpose: it drops all in-memory state from the old session.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign(`/sign-in?next=${encodeURIComponent(here)}`);
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
      },
    },
  });
}

function getQueryClient() {
  // Isolate server renders; keep one cache for the browser session.
  if (typeof window === "undefined") return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void usePreferences.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={getQueryClient()}>
        <TooltipProvider delayDuration={300}>
          {/* ThemeSync reads the URL; keep it inside Suspense so it never blocks prerendering. */}
          <Suspense fallback={null}>
            <ThemeSync />
          </Suspense>
          {children}
          <Toaster position="top-center" />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
