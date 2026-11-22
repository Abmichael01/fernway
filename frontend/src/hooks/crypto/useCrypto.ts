"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCryptoAssets, getMarketPrices, getPortfolioHistory, getPriceHistory, getTradeQuote, placeTrade } from "@/api/crypto";
import { queryKeys } from "@/hooks/query-keys";
import type { CryptoSymbol, PriceRange, TradeSide } from "@/types/banking";

export function useCryptoAssets() {
  return useQuery({
    queryKey: queryKeys.crypto.assets,
    queryFn: getCryptoAssets,
  });
}

/** Public prices for the homepage (no sign-in needed). */
export function useMarketPrices() {
  return useQuery({
    queryKey: queryKeys.crypto.market,
    queryFn: getMarketPrices,
    staleTime: 60_000,
  });
}

export function usePortfolioHistory(range: PriceRange) {
  return useQuery({
    queryKey: queryKeys.crypto.portfolioHistory(range),
    queryFn: () => getPortfolioHistory(range),
    staleTime: 60_000,
  });
}

export function usePriceHistory(symbol: CryptoSymbol, range: PriceRange) {
  return useQuery({
    queryKey: queryKeys.crypto.history(symbol, range),
    queryFn: () => getPriceHistory(symbol, range),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useTradeQuote(side: TradeSide, symbol: CryptoSymbol, amount: number | null) {
  return useQuery({
    queryKey: queryKeys.crypto.quote(side, symbol, amount ?? 0),
    queryFn: () => getTradeQuote({ side, symbol, amount: amount ?? 0 }),
    enabled: amount !== null && amount > 0,
    retry: false,
    staleTime: 15_000,
  });
}

export function usePlaceTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: placeTrade,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.crypto.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
      ]),
  });
}
