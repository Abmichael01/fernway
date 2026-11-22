"use client";

import Link from "next/link";
import { Check, Percent, ShieldCheck, Wallet } from "lucide-react";
import { CardFace } from "@/components/shared/card-face";
import type { PaymentCard } from "@/types/banking";

const showcaseCard: PaymentCard = {
  id: "promo",
  accountId: "promo",
  label: "Debit card",
  brand: "visa",
  kind: "physical",
  last4: "3391",
  expiry: "09/29",
  holderName: "YOUR NAME",
  frozen: false,
  onlinePayments: true,
  currency: "USD",
  monthlyLimit: 0,
  spentThisMonth: 0,
};

const badges = [
  { icon: Percent, className: "top-10 left-0" },
  { icon: ShieldCheck, className: "top-1/2 right-0" },
  { icon: Wallet, className: "bottom-0 left-1/2" },
];

export function CardPromo() {
  return (
    <section id="card" className="scroll-mt-6 bg-white py-[100px]">
      <div className="site-container grid items-center gap-16 lg:grid-cols-2">
        <div aria-hidden="true" className="reveal relative mx-auto h-[470px] w-full max-w-[540px]">
          <div className="absolute inset-y-0 left-10 right-16 bg-beige" />
          <div className="absolute top-12 left-1/2 h-[400px] w-[220px] -translate-x-1/2 rotate-[28deg] rounded-[38px] border-[10px] border-navy bg-[#d6d2cc] shadow-2xl" />
          <div className="absolute top-[150px] left-1/2 w-[320px] -translate-x-[58%] rotate-[28deg]">
            <CardFace card={showcaseCard} tone="accent" />
          </div>
          {badges.map((badge, index) => (
            <span
              key={index}
              className={`absolute grid size-[100px] place-items-center rounded-full bg-white text-navy shadow-[0_10px_30px_rgb(0_0_0/0.1)] ${badge.className}`}
            >
              <badge.icon className="size-10" strokeWidth={1.2} />
            </span>
          ))}
        </div>

        <div>
          <h2 className="font-dm text-[34px] leading-[1.15] font-medium text-navy sm:text-5xl sm:leading-[53px]">
            Get a Debit Card That Works as Hard as You Do
          </h2>
          <p className="mt-6 font-body text-lg text-stone">
            A physical Visa debit card for everyday spending, controlled directly from your account.
          </p>
          <ul className="mt-6 flex flex-col gap-3 font-body text-base text-stone">
            {["Freeze and unfreeze your card in one tap", "Turn online payments off when you don't need them"].map((point) => (
              <li key={point} className="flex items-center gap-3">
                <Check className="size-5 text-flame" strokeWidth={3} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
          <Link
            href="/sign-in"
            className="mt-10 inline-flex h-[60px] items-center bg-white px-[30px] font-dm text-lg font-medium text-navy shadow-[0_10px_30px_rgb(0_0_0/0.08)] transition-colors hover:bg-flame hover:text-white"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
