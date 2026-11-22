import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value?: ReactNode;
  detail?: ReactNode;
  loading?: boolean;
}

export function StatCard({ icon: Icon, label, value, detail, loading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </div>
        {loading ? (
          <>
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-36" />
          </>
        ) : (
          <>
            <div className="font-figure text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
            {detail && <div className="text-xs text-muted-foreground">{detail}</div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
