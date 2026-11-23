import type { Metadata } from "next";
import { AppShell } from "@/components/shared/app-shell/app-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
