import { Badge } from "@/components/ui/badge";
import type { DepositPaymentStatus, InvestEntryStatus, WithdrawalStatus } from "@/types/invest";

const WITHDRAWAL: Record<WithdrawalStatus, { label: string; className: string }> = {
  requested: { label: "Requested", className: "border-pending/40 text-pending" },
  paid: { label: "Paid", className: "border-credit/40 text-credit" },
  rejected: { label: "Declined", className: "border-debit/40 text-debit" },
  cancelled: { label: "Cancelled", className: "text-muted-foreground" },
};

export function WithdrawalStatusBadge({ status }: { status: WithdrawalStatus }) {
  const { label, className } = WITHDRAWAL[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

export function DepositStatusBadge({ status }: { status: DepositPaymentStatus }) {
  return status === "credited" ? (
    <Badge variant="outline" className="border-credit/40 text-credit">
      Credited
    </Badge>
  ) : (
    <Badge variant="outline" className="border-pending/40 text-pending">
      Pending
    </Badge>
  );
}

const ENTRY: Record<InvestEntryStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "border-pending/40 text-pending" },
  completed: { label: "Completed", className: "border-credit/40 text-credit" },
  failed: { label: "Failed", className: "border-debit/40 text-debit" },
};

export function EntryStatusBadge({ status }: { status: InvestEntryStatus }) {
  const { label, className } = ENTRY[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

export function ActiveBadge({ disabled }: { disabled: boolean }) {
  return disabled ? (
    <Badge variant="outline" className="border-debit/40 text-debit">
      Disabled
    </Badge>
  ) : (
    <Badge variant="outline" className="border-credit/40 text-credit">
      Active
    </Badge>
  );
}
