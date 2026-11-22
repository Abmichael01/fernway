import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/layout/admin-shell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Fernway admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return <AdminShell>{children}</AdminShell>;
}
