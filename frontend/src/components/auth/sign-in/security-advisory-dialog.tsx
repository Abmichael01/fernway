"use client";

import { useState, useSyncExternalStore } from "react";
import { AlertTriangle, GlobeLock, KeyRound, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "fw_sign_in_advisory_ack";
const noSubscription = () => () => {};

function isSessionAcknowledged(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function SecurityAdvisoryDialog() {
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = hydrated ? (manualOpen ?? !isSessionAcknowledged()) : false;

  const acknowledge = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage failures in restricted browsing contexts
    }
    setManualOpen(false);
  };

  return (
    <>
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => setManualOpen(true)}
          className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ShieldAlert className="size-3.5 text-primary" />
          <span>Security notice · Verify you&apos;re on fernwaybank.com</span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={(next) => (!next ? acknowledge() : setManualOpen(true))}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6" showCloseButton={false}>
          <DialogHeader className="text-left">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/12 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="size-5" />
              </span>
              <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">
                Security Notice
              </span>
            </div>
            <DialogTitle className="font-heading text-xl font-bold tracking-tight">
              Stay safe from fake websites
            </DialogTitle>
            <DialogDescription className="pt-1 text-sm leading-relaxed text-muted-foreground">
              Before signing in, confirm you are on the genuine Fernway Online Banking portal.
            </DialogDescription>
          </DialogHeader>

          <ul className="my-1 space-y-3 rounded-xl border border-border bg-muted/35 p-4 text-xs leading-relaxed text-foreground/90">
            <li className="flex items-start gap-3">
              <GlobeLock className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <strong className="font-semibold text-foreground">Check the address bar:</strong>{" "}
                Always verify the URL is{" "}
                <span className="rounded bg-primary/12 px-1.5 py-0.5 font-mono font-semibold text-primary">
                  fernwaybank.com
                </span>{" "}
                with a secure <span className="font-mono">https://</span> connection.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong className="font-semibold text-foreground">Avoid unofficial or lookalike pages:</strong>{" "}
                Never sign in through unexpected links in emails, texts, social media messages, or cloned/unofficial sites.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <KeyRound className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <strong className="font-semibold text-foreground">Protect your credentials:</strong>{" "}
                Fernway staff will never ask for your password, 4-digit transaction PIN, or email verification code.
              </span>
            </li>
          </ul>

          <div className="pt-1">
            <Button
              type="button"
              onClick={acknowledge}
              className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:opacity-95"
            >
              I understand, continue to sign in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
