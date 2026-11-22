import type { Metadata } from "next";
import { CustomersView } from "@/components/admin/home/customers-view";

/** Admin pages wait for the access check before rendering, so they opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Customers" };

export default function AdminHomePage() {
  return <CustomersView />;
}
