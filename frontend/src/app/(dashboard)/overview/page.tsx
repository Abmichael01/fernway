import type { Metadata } from "next";
import { CardWidget } from "@/components/dashboard/overview/card-widget";
import { CashFlowChart } from "@/components/dashboard/overview/cash-flow-chart";
import { RecentActivity } from "@/components/dashboard/overview/recent-activity";
import { SavingsGoal } from "@/components/dashboard/overview/savings-goal";
import { SpendingBreakdown } from "@/components/dashboard/overview/spending-breakdown";
import { UpcomingPayments } from "@/components/dashboard/overview/upcoming-payments";
import { WelcomeBanner } from "@/components/dashboard/overview/welcome-banner";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CashFlowChart />
        </div>
        <CardWidget />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentActivity />
        </div>
        <SpendingBreakdown />
      </div>
      <div className="grid items-start gap-6 md:grid-cols-2">
        <UpcomingPayments />
        <SavingsGoal />
      </div>
    </div>
  );
}
