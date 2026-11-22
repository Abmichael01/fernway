"use client";

import { useMutation } from "@tanstack/react-query";
import { investSignOut } from "@/api/invest";
import { investConfig } from "@/config/invest";

/**
 * Signs out, then does a full page load to the sign-in page. The full load drops every cached
 * query of the old session at once, so nothing refetches with the cleared cookie in between.
 */
export function useInvestSignOut() {
  return useMutation({
    mutationFn: investSignOut,
    onSettled: () => {
      window.location.assign(investConfig.signInPath);
    },
  });
}
