import type { ReactNode } from "react";
import { RotateCw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface QueryErrorProps {
  message: string;
  onRetry: () => void;
  className?: string;
}

export function QueryError({ message, onRetry, className }: QueryErrorProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-3 rounded-lg border border-dashed border-debit/40 p-4 text-sm",
        className,
      )}
    >
      <p>{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCw data-icon="inline-start" />
        Try again
      </Button>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <Empty className={cn("py-10", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon ?? <SearchX />}</EmptyMedia>
        <EmptyTitle className="font-heading">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
