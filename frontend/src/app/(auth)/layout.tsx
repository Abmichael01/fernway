import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { Guilloche } from "@/components/shared/guilloche";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative isolate hidden overflow-hidden bg-brand p-10 text-brand-foreground lg:flex lg:flex-col lg:justify-between">
        <Guilloche
          variant="plate"
          animated
          className="absolute top-1/2 left-1/2 -z-10 size-[46rem] -translate-x-1/2 -translate-y-1/2 text-brass opacity-80"
        />
        <Link href="/" className="self-start rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <BrandMark />
        </Link>
        <p className="max-w-sm font-heading text-3xl leading-tight font-bold tracking-tight">
          Online banking, debit cards and transfers. Accounted for to the cent.
        </p>
      </aside>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link href="/" className="rounded-md text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring lg:invisible dark:text-foreground">
            <BrandMark />
          </Link>
          <ThemeToggle />
        </div>
        <main className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="flex w-full max-w-sm flex-col gap-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
