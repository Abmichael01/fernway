"use client";

import { IfSupportEmail, SupportEmailAddress, SupportEmailLink } from "@/components/shared/support-email";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CreditCard,
  Headset,
  type LucideIcon,
  MonitorSmartphone,
  ArrowRightLeft,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionTitle } from "./section-title";

const categories: Array<{ key: string; icon: LucideIcon; title: string; requests: string[] }> = [
  {
    key: "cards",
    icon: CreditCard,
    title: "Cards",
    requests: ["Freeze Your Debit Card", "Turn Off Online Payments", "Get a Virtual Card", "Set a Monthly Card Limit"],
  },
  {
    key: "online",
    icon: MonitorSmartphone,
    title: "App & Insights",
    requests: ["See Spending by Category", "Track a Savings Goal", "Search Your Transactions", "Hide Balances on Screen"],
  },
  {
    key: "details",
    icon: UserCog,
    title: "Account Details",
    requests: ["Find Your Routing Number", "Find Your Account Number", "See Upcoming Bills", "Check Your Available Balance"],
  },
  {
    key: "transfers",
    icon: ArrowRightLeft,
    title: "Transfers & Crypto",
    requests: ["Send Money by ACH or Wire", "Move Money Between Accounts", "Save a Recipient", "Buy or Sell Crypto"],
  },
];

export function ServiceRequests() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = categories[activeIndex];
  const step = (by: number) => setActiveIndex((index) => (index + by + categories.length) % categories.length);

  return (
    <section id="support" className="scroll-mt-6 bg-beige py-[100px]">
      <div className="site-container">
        <SectionTitle title="Service Requests" subtitle="Everything you can do yourself in the Lindenway app." />

        <div className="relative mt-14 lg:px-[-80px]">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous category"
            className="absolute top-[60px] -left-[65px] hidden size-[50px] place-items-center rounded-full border border-black/10 text-navy hover:bg-white xl:grid"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div role="tablist" aria-label="Request categories" className="grid grid-cols-2 md:grid-cols-4">
            {categories.map((category, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  key={category.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="support-panel"
                  onClick={() => setActiveIndex(index)}
                  className="flex flex-col items-center border-black/10 px-4 pb-4 text-center md:border-l md:last:border-r"
                >
                  <span
                    className={cn(
                      "grid size-[90px] place-items-center rounded-full transition-colors",
                      selected ? "bg-white text-flame shadow-sm" : "border border-black/10 text-navy",
                    )}
                  >
                    <category.icon className="size-9" strokeWidth={1.3} aria-hidden="true" />
                  </span>
                  <span className="mt-6 max-w-[180px] font-dm text-lg leading-7 font-medium text-navy">{category.title}</span>
                  <ChevronDown className={cn("mt-2 size-6 text-flame", selected ? "visible" : "invisible")} aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next category"
            className="absolute top-[60px] -right-[65px] hidden size-[50px] place-items-center rounded-full border border-black/10 text-navy hover:bg-white xl:grid"
          >
            <ArrowRight className="size-5" />
          </button>
        </div>

        <div id="support-panel" role="tabpanel" className="reveal mt-12 grid gap-[30px] lg:grid-cols-2">
          <ul className="bg-white">
            {active.requests.map((request) => (
              <li key={request} className="border-b border-black/5 last:border-0">
                <Link
                  href="/sign-in"
                  className="group flex h-[71px] items-center justify-between font-dm text-lg font-medium text-navy"
                >
                  <span className="px-[30px]">{request}</span>
                  <span className="grid h-full w-[70px] place-items-center border-l border-black/5 text-stone transition-colors group-hover:bg-flame group-hover:text-white">
                    <ArrowRight className="size-5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <IfSupportEmail>
            <div className="relative isolate grid min-h-[284px] overflow-hidden bg-navy sm:grid-cols-[1fr_1fr]">
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center text-white">
                <Headset className="size-12" strokeWidth={1.3} aria-hidden="true" />
                <p className="mt-2 font-dm text-lg font-medium">Talk to</p>
                <p className="font-dm text-2xl font-medium">Our Support Team</p>
                <SupportEmailLink className="mt-3 font-dm text-xl font-medium text-amber hover:underline">
                  <SupportEmailAddress />
                </SupportEmailLink>
              </div>
              <div className="relative hidden sm:block">
                <Image src="/images/site/support-agent.jpg" alt="Lindenway Bank customer support team member" fill sizes="285px" className="object-cover" />
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 -left-px w-16 bg-navy [clip-path:polygon(0_0,100%_0,0_50%,100%_100%,0_100%)]"
                />
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 h-1/2 w-16 bg-ember [clip-path:polygon(0_0,100%_0,0_100%)]"
                />
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-1/2 w-16 bg-ember [clip-path:polygon(0_0,0_100%,100%_100%)]"
                />
              </div>
            </div>
          </IfSupportEmail>
        </div>
      </div>
    </section>
  );
}
