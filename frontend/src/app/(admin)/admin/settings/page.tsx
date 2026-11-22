import type { Metadata } from "next";
import { SettingsView } from "@/components/admin/settings/settings-view";

/** Admin pages wait for the access check before rendering, so they opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return <SettingsView />;
}
