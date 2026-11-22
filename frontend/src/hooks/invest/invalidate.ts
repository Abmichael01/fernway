import type { QueryClient } from "@tanstack/react-query";
import { investKeys } from "./keys";

/** Everything a money movement can change. */
export function invalidateAfterMoneyMovement(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: investKeys.overview }),
    queryClient.invalidateQueries({ queryKey: investKeys.historyAll }),
    queryClient.invalidateQueries({ queryKey: investKeys.transactions }),
    queryClient.invalidateQueries({ queryKey: investKeys.withdrawals }),
  ]);
}
