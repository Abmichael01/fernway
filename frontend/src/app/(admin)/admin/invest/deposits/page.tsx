import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DepositsView } from "@/components/admin/invest/deposits/deposits-view";
import { INVEST_ENABLED } from "@/config/features";

/** Admin pages wait for the access check before rendering, so they opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Invest deposits" };

export default function Page() {
  if (!INVEST_ENABLED) notFound();
  return <DepositsView />;
}
