import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Transaction } from "@/types/banking";
import { TransactionRow } from "./transaction-row";

const transaction: Transaction = {
  id: "txn_1",
  accountId: "acc_everyday",
  direction: "credit",
  amount: 120_000,
  fee: 0,
  currency: "USD",
  counterparty: "Priya Natarajan",
  narration: "Rent share",
  category: "transfer",
  channel: "ach",
  status: "pending",
  reference: "FW000000000001",
  createdAt: new Date(2026, 10, 2, 19, 5).toISOString(),
};

describe("TransactionRow", () => {
  it("shows a signed credit with its status", () => {
    render(<TransactionRow transaction={transaction} />);
    expect(screen.getByText("Priya Natarajan")).toBeInTheDocument();
    expect(screen.getByText("+$1,200.00")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("hands the transaction to onSelect", async () => {
    const onSelect = vi.fn();
    render(<TransactionRow transaction={{ ...transaction, status: "completed" }} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "txn_1" }));
    expect(screen.queryByText("Pending")).not.toBeInTheDocument();
  });
});
