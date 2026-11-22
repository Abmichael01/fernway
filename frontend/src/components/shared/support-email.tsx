"use client";

import type { ComponentProps, ReactNode } from "react";
import { useSiteSettings } from "@/hooks/settings/useSiteSettings";

/**
 * The support email comes from admin Settings. Until the admin sets one, every contact link is
 * hidden, so the site never shows an address nobody reads. These components take plain props
 * (no render functions), so Server Components can use them too.
 */

/** The address, or null while loading or when none is set. */
export function useSupportEmail(): string | null {
  return useSiteSettings().data?.supportEmail ?? null;
}

/** Shows its children only when a support email is set. */
export function IfSupportEmail({ children }: { children: ReactNode }) {
  return useSupportEmail() ? <>{children}</> : null;
}

/** The address as text. */
export function SupportEmailAddress() {
  return <>{useSupportEmail()}</>;
}

/** A mailto link to the support email (shows the address when it has no children). Renders nothing when unset. */
export function SupportEmailLink({ subject, children, ...props }: Omit<ComponentProps<"a">, "href"> & { subject?: string }) {
  const email = useSupportEmail();
  if (!email) return null;
  const href = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  return (
    <a {...props} href={href}>
      {children ?? email}
    </a>
  );
}
