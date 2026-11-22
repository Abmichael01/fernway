"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import {
  PREVIEW_STORAGE_KEY,
  PREVIEW_TOKEN_STORAGE_KEY,
  parsePreviewPayload,
  readClientPreviewState,
  sanitizePreviewToken,
} from "@/lib/preview";

const listeners = new Set<() => void>();

function notifyPreviewListeners() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribePreview(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getClientPreviewSnapshot(): string | null {
  return readClientPreviewState().payload;
}

function getServerPreviewSnapshot(): string | null {
  return null;
}

interface PreviewBannerProps {
  serverBanner: React.ReactNode;
}

/**
 * Syncs per-iframe live preview parameters (URL query or postMessage from SharpToolz)
 * into sessionStorage and renders the matching Simulation Notice banner when previewing.
 */
export function PreviewAwareBanner({ serverBanner }: PreviewBannerProps) {
  const queryClient = useQueryClient();
  const rawPreview = useSyncExternalStore(
    subscribePreview,
    getClientPreviewSnapshot,
    getServerPreviewSnapshot,
  );
  const preview = parsePreviewPayload(rawPreview);

  useEffect(() => {
    // Strip preview query params from URL once persisted into this iframe's sessionStorage
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("preview") || url.searchParams.has("previewToken")) {
        readClientPreviewState();
        url.searchParams.delete("preview");
        url.searchParams.delete("previewToken");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    } catch {
      // Ignore history restrictions
    }

    const onMessage = (event: MessageEvent) => {
      const data = event.data as
        | { type?: string; payload?: string; token?: string | null }
        | null;
      if (!data || data.type !== "FERNWAY_PREVIEW_UPDATE" || typeof data.payload !== "string") {
        return;
      }
      const parsed = parsePreviewPayload(data.payload);
      if (!parsed) return;
      try {
        window.sessionStorage.setItem(PREVIEW_STORAGE_KEY, data.payload);
        const safeToken = sanitizePreviewToken(data.token);
        if (safeToken) {
          window.sessionStorage.setItem(PREVIEW_TOKEN_STORAGE_KEY, safeToken);
        } else {
          window.sessionStorage.removeItem(PREVIEW_TOKEN_STORAGE_KEY);
        }
      } catch {
        // sessionStorage unavailable
      }
      notifyPreviewListeners();
      void queryClient.invalidateQueries();
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [queryClient]);

  if (!preview) return <>{serverBanner}</>;
  if (preview.isLive) return null;

  const isExpired = preview.subscriptionStatus === "expired";
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center justify-center gap-2 border-b border-amber-500/35 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900 dark:bg-amber-950/90 dark:text-amber-200"
    >
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
        <AlertTriangle className="size-3" />
        Simulation Notice
      </span>
      <span>
        {isExpired
          ? "This account's monthly subscription has expired. Renew it in SharpToolz to remove this notice."
          : "This is a simulated test account. Activate a Live Account in SharpToolz to remove this notice."}
      </span>
    </div>
  );
}
