import { IfSupportEmail, SupportEmailLink } from "@/components/shared/support-email";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

export function SloganBanner() {
  return (
    <section className="relative isolate overflow-hidden bg-navy">
      <div className="absolute inset-y-0 right-0 -z-20 hidden w-[62%] md:block">
        <Image src="/images/site/slogan-friends.jpg" alt="" fill sizes="62vw" className="object-cover opacity-60 grayscale" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/90 to-navy/40" />
      <div className="site-container flex min-h-[229px] flex-col justify-center gap-8 py-12 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-dm text-3xl font-medium text-white sm:text-[40px]">Your Money, Right in Your Pocket.</h2>
          <p className="mt-3 font-body text-base text-white/70">Online banking, debit cards and transfers, available on any device.</p>
        </div>
        <div className="flex flex-wrap gap-5">
          <Link
            href="/sign-in"
            className="inline-flex h-[55px] items-center gap-3 bg-white px-[30px] font-dm text-lg font-medium text-navy transition-colors hover:bg-beige"
          >
            <ArrowRight className="size-5 text-flame" aria-hidden="true" />
            Sign In
          </Link>
          <IfSupportEmail>
            <SupportEmailLink className="inline-flex h-[55px] items-center gap-3 bg-flame px-[30px] font-dm text-lg font-medium text-white transition-colors hover:bg-ember">
              <Mail className="size-5" aria-hidden="true" />
              Contact Us
            </SupportEmailLink>
          </IfSupportEmail>
        </div>
      </div>
    </section>
  );
}
