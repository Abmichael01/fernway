"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser } from "@/hooks/users/useCurrentUser";

/**
 * Sends signed-in customers back to their own app. This is for a clean experience only:
 * every admin API route checks the admin role on the server.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (user && !isAdmin) router.replace("/overview");
  }, [user, isAdmin, router]);

  if (!isAdmin) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-muted-foreground" role="status">
        <Spinner className="size-6" />
        <span className="sr-only">Checking access…</span>
      </div>
    );
  }
  return children;
}
