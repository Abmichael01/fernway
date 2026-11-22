"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import { getInvestMe } from "@/api/invest";
import { investKeys } from "./keys";

export function useInvestMe() {
  return useQuery({
    queryKey: investKeys.me,
    queryFn: getInvestMe,
    staleTime: 5 * 60_000,
    retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
  });
}
