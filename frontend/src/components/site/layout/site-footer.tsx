import { IfSupportEmail, SupportEmailAddress, SupportEmailLink } from "@/components/shared/support-email";
import Link from "next/link";
import { FileText, MessageSquareText } from "lucide-react";
import { footerColumns, savingsApy } from "@/config/marketing";
import { siteConfig } from "@/config/site";
import { SiteLogo } from "./site-logo";

export function SiteFooter() {
  return (
    <footer id="contact" className="relative isolate overflow-hidden bg-navy font-body text-white">
      <FooterShapes />
      <div className="site-container grid gap-10 pt-[100px] pb-[50px] sm:grid-cols-2 lg:grid-cols-4">
        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="font-dm text-[22px] font-medium">{column.title}</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="site-container grid items-center gap-10 pt-20 pb-[70px] lg:grid-cols-3">
          <div className="flex flex-col gap-5">
            <SiteLogo tone="brand" />
            <p className="text-white/60">
              Copyright © <span className="font-medium text-white">{siteConfig.name}</span>
            </p>
          </div>
          <div className="flex flex-col gap-5">
            <IfSupportEmail>
              <div>
                <SupportEmailLink className="font-dm text-2xl font-medium hover:text-amber">
                  <SupportEmailAddress />
                </SupportEmailLink>
                <p className="mt-1 text-white/60">Customer Care</p>
              </div>
            </IfSupportEmail>
          </div>
          <div className="flex flex-col gap-5">
            <Link
              href="/#rates"
              className="flex h-[54px] items-center justify-between border border-white/15 px-5 font-dm text-lg font-medium hover:border-white/40"
            >
              Rates & Fee Schedule
              <FileText className="size-5 text-white/70" aria-hidden="true" />
            </Link>
            <IfSupportEmail>
              <SupportEmailLink
                subject="Complaint"
                className="flex h-[54px] items-center justify-between border border-white/15 px-5 font-dm text-lg font-medium hover:border-white/40"
              >
                Register Your Complaint
                <MessageSquareText className="size-5 text-white/70" aria-hidden="true" />
              </SupportEmailLink>
            </IfSupportEmail>
          </div>
        </div>
      </div>

      <div className="bg-navy-deep">
        <div className="site-container flex flex-col gap-4 py-7 text-sm text-white/50">
          <div className="flex flex-wrap gap-x-7 gap-y-2 text-base text-white/70">
            <Link href="/#services" className="hover:text-white">
              All Accounts
            </Link>
            <Link href="/#rates" className="hover:text-white">
              Rates & Fees
            </Link>
            <Link href="/sign-in" className="hover:text-white">
              Login
            </Link>
          </div>
          <p>
            ¹ {savingsApy} Annual Percentage Yield (APY) on High-Yield Savings. APYs are variable and can change at any time.
          </p>
          <p>
            {siteConfig.name} is a financial technology company, not a bank. Crypto is not a bank deposit, is not FDIC insured, is
            not insured by any federal government agency, and may lose value.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterShapes() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 780"
      preserveAspectRatio="none"
      className="absolute inset-0 -z-10 h-full w-full text-white/[0.03]"
    >
      <polygon points="0,0 220,0 0,260" fill="currentColor" />
      <polygon points="120,120 340,420 120,420" fill="currentColor" />
      <polygon points="1440,80 1220,320 1440,560" fill="currentColor" />
      <polygon points="1250,420 1440,780 1060,780" fill="currentColor" />
    </svg>
  );
}
