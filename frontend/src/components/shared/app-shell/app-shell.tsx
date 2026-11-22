import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BrandMark } from "../brand-mark";
import { ThemeToggle } from "../theme-toggle";
import { AppSidebar } from "./app-sidebar";
import { CurrentPageTitle } from "./current-page-title";
import { MobileNav } from "./mobile-nav";
import { PreviewAwareBanner } from "./preview-banner";
import { UserMenu } from "./user-menu";
import { SupportWidget } from "@/components/dashboard/support/support-widget";
import { getSimulationNoticeMode } from "@/server/selectors/banking";

async function TestModeBanner() {
  const mode = await getSimulationNoticeMode();
  if (mode === "none") return null;
  const isExpired = mode === "expired";
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center justify-center gap-2 border-b border-amber-500/35 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900 dark:bg-amber-950/90 dark:text-amber-200"
    >
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
        <AlertTriangle className="size-3" />
        Simulation Notice
      </span>
      <span>
        {isExpired
          ? "This account's monthly subscription has expired. Renew it in SharpToolz to remove this notice."
          : "This is a simulated test account. Activate a Live Account in SharpToolz to remove this notice."}
      </span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-white dark:bg-background">
        <div className="sticky top-0 z-30">
          <PreviewAwareBanner
            serverBanner={
              <Suspense fallback={null}>
                <TestModeBanner />
              </Suspense>
            }
          />
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white/90 px-4 backdrop-blur dark:bg-background/90 sm:px-6">
            <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
            <Separator orientation="vertical" className="mr-1 hidden data-[orientation=vertical]:h-4 md:block" />
            <Link href="/overview" className="rounded-md text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden">
              <BrandMark />
            </Link>
            <CurrentPageTitle className="hidden md:block" />
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <div className="md:hidden">
                <UserMenu variant="compact" />
              </div>
            </div>
          </header>
        </div>
        <div className="mx-auto w-full max-w-[1240px] px-4 pt-6 pb-28 sm:px-6 md:pb-12 lg:px-8">{children}</div>
      </SidebarInset>
      <MobileNav />
      <SupportWidget />
    </SidebarProvider>
  );
}
