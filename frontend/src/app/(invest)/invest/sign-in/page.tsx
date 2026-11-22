import type { Metadata } from "next";
import { InvestSignInView } from "@/components/invest/sign-in/sign-in-view";

export const metadata: Metadata = { title: "Sign in" };

export default function InvestSignInPage() {
  return <InvestSignInView />;
}
