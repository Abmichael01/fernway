import { Skeleton } from "@/components/ui/skeleton";

export function RowsSkeleton({ rows = 5, className = "h-16" }: { rows?: number; className?: string }) {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className={`${className} w-full`} />
      ))}
    </div>
  );
}
