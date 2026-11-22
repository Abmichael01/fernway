import { useMutation } from "@tanstack/react-query";
import { createInvestCheckout } from "@/api/invest";

export function useCreateInvestCheckout() {
  return useMutation({ mutationFn: createInvestCheckout });
}
