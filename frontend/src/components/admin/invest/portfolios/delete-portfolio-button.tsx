"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeletePortfolio } from "@/hooks/admin-invest/useDeletePortfolio";
import type { AdminPortfolio } from "@/types/invest";

/** Only offered while nobody holds anything in the portfolio. */
export function DeletePortfolioButton({ portfolio }: { portfolio: AdminPortfolio }) {
  const remove = useDeletePortfolio();
  const run = async () => {
    try {
      await remove.mutateAsync(portfolio.id);
      toast.success("Portfolio deleted");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "We couldn't reach the server. Try again.");
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={remove.isPending}>
          <Trash2 data-icon="inline-start" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {portfolio.name}?</AlertDialogTitle>
          <AlertDialogDescription>No customer holds anything in it. This can&apos;t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => void run()}>Delete portfolio</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
