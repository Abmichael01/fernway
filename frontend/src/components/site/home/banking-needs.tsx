"use client";

import { IfSupportEmail, SupportEmailLink } from "@/components/shared/support-email";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowRightLeft,
  ChevronDown,
  Landmark,
  type LucideIcon,
  MessagesSquare,
  PiggyBank,
  Smartphone,
  Target,
  TrendingUp,
} from "lucide-react";
import { savingsApy } from "@/config/marketing";
import { cn } from "@/lib/utils";
import { SectionTitle } from "./section-title";

interface ServiceCard {
  icon: LucideIcon;
  title: string;
  text: string;
  note: string;
}

const groups: Array<{ key: string; eyebrow: string; title: string; cards: ServiceCard[] }> = [
  {
    key: "everyday",
    eyebrow: "Built for",
    title: "Everyday Money",
    cards: [
      {
        icon: Landmark,
        title: "Checking & Debit Card",
        text: "Get paid by direct deposit, pay bills and spend with a debit card, all from one account.",
        note: "No fee for standard ACH transfers",
      },
      {
        icon: Smartphone,
        title: "Online & Mobile",
        text: "Manage your money anywhere with a secure app, instant card controls and live transactions.",
        note: "Freeze a card in one tap",
      },
      {
        icon: ArrowRightLeft,
        title: "Same-Day Transfers",
        text: "Send money by standard ACH, same-day ACH or wire, and see the fee before you confirm.",
        note: "Same-day ACH for $2.00",
      },
    ],
  },
  {
    key: "growing",
    eyebrow: "Built for",
    title: "Saving & Investing",
    cards: [
      {
        icon: PiggyBank,
        title: "High-Yield Savings",
        text: "Earn a competitive rate on your savings and move money to checking instantly, any time.",
        note: `Interest rate ${savingsApy} APY¹`,
      },
      {
        icon: Target,
        title: "Savings Goals",
        text: "Set a target for your emergency fund or next big purchase and watch your progress grow.",
        note: "Track progress in the app",
      },
      {
        icon: TrendingUp,
        title: "Crypto Trading",
        text: "Buy and sell Bitcoin, Ethereum, Solana and USD Coin from $10, right next to your cash.",
        note: "Crypto is not FDIC insured",
      },
    ],
  },
];

export function BankingNeeds() {
  const [active, setActive] = useState(groups[0].key);
  const group = groups.find((item) => item.key === active) ?? groups[0];

  return (
    <section id="services" className="relative isolate scroll-mt-6 overflow-hidden bg-navy py-[100px]">
      <Image src="/images/site/services-bg.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover opacity-40 grayscale" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/70 via-navy/80 to-navy" />
      <div className="site-container">
        <div className="flex items-start justify-between gap-6">
          <SectionTitle
            title="Built For Your Needs"
            subtitle="Everyday money, savings and crypto, all in one place."
            tone="light"
            align="left"
          />
          <IfSupportEmail>
            <SupportEmailLink
              aria-label="Chat with us by email"
              className="hidden size-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-flame to-ember text-white shadow-lg sm:grid"
            >
              <MessagesSquare className="size-8" />
            </SupportEmailLink>
          </IfSupportEmail>
        </div>

        <div role="tablist" aria-label="Service groups" className="mt-14 grid gap-2.5 md:grid-cols-2">
          {groups.map((item) => {
            const selected = item.key === active;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`services-${item.key}`}
                id={`services-tab-${item.key}`}
                onClick={() => setActive(item.key)}
                className={cn(
                  "flex h-[140px] items-center justify-between px-10 text-left transition-colors",
                  selected ? "border border-white/10 bg-navy text-white" : "bg-white text-navy",
                )}
              >
                <span>
                  <span className={cn("block font-body text-lg", selected ? "text-white/70" : "text-stone")}>{item.eyebrow}</span>
                  <span className="mt-1 block font-dm text-[32px] leading-tight font-medium sm:text-4xl">{item.title}</span>
                </span>
                <span
                  className={cn(
                    "grid size-[50px] shrink-0 place-items-center",
                    selected ? "bg-white text-navy" : "bg-beige text-stone-light",
                  )}
                >
                  <ChevronDown className="size-6" />
                </span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`services-${group.key}`}
          aria-labelledby={`services-tab-${group.key}`}
          className="reveal mt-[60px] grid gap-[30px] md:grid-cols-3"
        >
          {group.cards.map((card) => (
            <Link
              key={card.title}
              href="/sign-in"
              className="group relative flex flex-col border border-white/10 bg-navy/90 p-10 text-white transition-colors hover:border-white/30"
            >
              <span className="absolute top-5 right-5 grid size-10 place-items-center border border-white/30 transition-colors group-hover:bg-white group-hover:text-navy">
                <ArrowRight className="size-5" />
              </span>
              <card.icon className="size-10" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-6 font-dm text-[22px] font-medium">{card.title}</h3>
              <span className="mt-5 flex h-[3px]">
                <span className="w-[50px] bg-flame" />
                <span className="flex-1 bg-white/20" />
              </span>
              <p className="mt-7 font-body text-base leading-[26px] text-white/65">{card.text}</p>
              <p className="mt-4 font-body text-base text-white/75">
                <span className="text-amber">* </span>
                {card.note}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-[60px] flex justify-center">
          <Link
            href="/sign-in"
            className="inline-flex h-[60px] items-center bg-white px-[30px] font-dm text-lg font-medium text-navy transition-colors hover:bg-flame hover:text-white"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}
