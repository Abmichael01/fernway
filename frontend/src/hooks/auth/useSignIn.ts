"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn } from "@/api/auth";
import { queryKeys } from "@/hooks/query-keys";

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (user) => queryClient.setQueryData(queryKeys.currentUser, user),
  });
}
