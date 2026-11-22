"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { investSignIn } from "@/api/invest";
import { investKeys } from "./keys";

export function useInvestSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: investSignIn,
    onSuccess: (user) => {
      queryClient.removeQueries({ queryKey: investKeys.all });
      queryClient.setQueryData(investKeys.me, user);
    },
  });
}
