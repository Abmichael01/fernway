import React from "react";
import { cn } from "@/lib/utils";

interface CryptoIconProps {
  symbol: string;
  className?: string;
  size?: number;
}

export function CryptoIcon({ symbol, className, size = 36 }: CryptoIconProps) {
  const s = symbol.toUpperCase();

  switch (s) {
    case "BTC":
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={cn("shrink-0 rounded-full", className)}
          aria-label="Bitcoin"
        >
          <circle cx="16" cy="16" r="16" fill="#F7931A" />
          <path
            fill="#FFFFFF"
            d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.745-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.532-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.703 2.82 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.535 2.146-4.148.986-5.32.695l.95-3.805c1.17.292 4.928.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"
          />
        </svg>
      );

    case "ETH":
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={cn("shrink-0 rounded-full", className)}
          aria-label="Ethereum"
        >
          <circle cx="16" cy="16" r="16" fill="#627EEA" />
          <g fill="#FFFFFF" fillRule="nonzero">
            <path fillOpacity="0.6" d="M16.498 4v8.87l7.497 3.35z" />
            <path d="M16.498 4L9 16.22l7.498-3.35z" />
            <path fillOpacity="0.6" d="M16.498 21.968v6.027L24 17.616z" />
            <path d="M16.498 27.995v-6.028L9 17.616z" />
            <path fillOpacity="0.2" d="M16.498 20.573l7.497-4.353-7.497-3.35z" />
            <path fillOpacity="0.6" d="M9 16.22l7.498 4.353v-7.703z" />
          </g>
        </svg>
      );

    case "SOL":
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={cn("shrink-0 rounded-full", className)}
          aria-label="Solana"
        >
          <circle cx="16" cy="16" r="16" fill="#000000" />
          <defs>
            <linearGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9945FF" />
              <stop offset="50%" stopColor="#8752F3" />
              <stop offset="100%" stopColor="#14F195" />
            </linearGradient>
          </defs>
          <path
            fill="url(#solGrad)"
            d="M8.5 21.8a.7.7 0 01.5-.2h14.8c.3 0 .5.3.3.6l-2.6 3.6a.7.7 0 01-.5.2H6.2c-.3 0-.5-.3-.3-.6l2.6-3.6zm0-12a.7.7 0 01.5-.2h14.8c.3 0 .5.3.3.6l-2.6 3.6a.7.7 0 01-.5.2H6.2c-.3 0-.5-.3-.3-.6l2.6-3.6zm15 6a.7.7 0 00-.5-.2H8.2c-.3 0-.5.3-.3.6l2.6 3.6c.1.2.3.2.5.2h14.8c.3 0 .5-.3.3-.6l-2.6-3.6z"
          />
        </svg>
      );

    case "BNB":
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={cn("shrink-0 rounded-full", className)}
          aria-label="BNB"
        >
          <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
          <path
            fill="#FFFFFF"
            d="M12.115 14.004l3.885-3.885 3.888 3.888 2.261-2.261-6.149-6.149-6.147 6.147 2.262 2.26zm-4.52 1.996l2.26-2.26 2.261 2.26-2.261 2.261-2.26-2.261zm8.405 1.996l3.887 3.887-3.887 3.888-3.886-3.888 3.886-3.887zm6.145-1.996l2.261-2.26 2.261 2.26-2.261 2.261-2.261-2.261zm-3.884 0l-2.261-2.261-2.26 2.261 2.26 2.26 2.261-2.26zm6.148 4.257l-2.261-2.261-3.888 3.888-3.885-3.888-2.262 2.261 6.147 6.147 6.149-6.147z"
          />
        </svg>
      );

    case "USDT":
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={cn("shrink-0 rounded-full", className)}
          aria-label="Tether"
        >
          <circle cx="16" cy="16" r="16" fill="#26A17B" />
          <path
            fill="#FFFFFF"
            d="M17.922 17.383c-.11.008-.68.04-1.636.04-.766 0-1.425-.027-1.62-.04-.03-.002-.06-.003-.088-.003-3.66-.184-6.39-.993-6.39-1.96 0-.968 2.73-1.777 6.39-1.96.223-.01.914-.038 1.708-.038.948 0 1.54.027 1.636.038 3.66.183 6.39.992 6.39 1.96 0 .967-2.73 1.776-6.39 1.963zm0-4.887V9.75h4.945V6.5H9.133v3.25h4.945v2.744c-4.475.253-7.828 1.34-7.828 2.656 0 1.315 3.353 2.403 7.828 2.656V25.5h3.844V17.808c4.473-.254 7.825-1.343 7.825-2.658 0-1.314-3.352-2.403-7.825-2.654z"
          />
        </svg>
      );

    case "USDC":
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={cn("shrink-0 rounded-full", className)}
          aria-label="USD Coin"
        >
          <circle cx="16" cy="16" r="16" fill="#2775CA" />
          <path
            fill="#FFFFFF"
            d="M16 6.5C10.753 6.5 6.5 10.753 6.5 16s4.253 9.5 9.5 9.5 9.5-4.253 9.5-9.5-4.253-9.5-9.5-9.5zm0 17.5c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm1.25-12.25h-2.5v1.03c-1.393.25-2.5 1.25-2.5 2.72 0 1.63 1.14 2.39 2.84 2.82 1.34.34 1.66.72 1.66 1.43 0 .76-.64 1.31-1.66 1.31-1.12 0-1.74-.53-1.89-1.42h-1.68c.17 1.62 1.31 2.66 2.73 2.9v1.06h2.5v-1.05c1.46-.26 2.59-1.28 2.59-2.76 0-1.57-1.04-2.42-2.82-2.85-1.32-.32-1.68-.76-1.68-1.39 0-.71.59-1.23 1.57-1.23 1.01 0 1.58.48 1.72 1.27h1.66c-.15-1.53-1.19-2.54-2.54-2.79V11.75z"
          />
        </svg>
      );

    case "POL":
    case "MATIC":
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={cn("shrink-0 rounded-full", className)}
          aria-label="Polygon"
        >
          <circle cx="16" cy="16" r="16" fill="#8247E5" />
          <path
            fill="#FFFFFF"
            d="M20.89 13.91l-4.14-2.39a1.5 1.5 0 00-1.5 0l-4.14 2.39a1.5 1.5 0 00-.75 1.3v4.78a1.5 1.5 0 00.75 1.3l4.14 2.39a1.5 1.5 0 001.5 0l4.14-2.39a1.5 1.5 0 00.75-1.3v-4.78a1.5 1.5 0 00-.75-1.3zm-4.89 8.2l-3.39-1.96v-3.92l3.39 1.96v3.92zm4.14-2.39l-3.39 1.96v-3.92l3.39-1.96v3.92zm-3.39-6.69l3.39 1.96-3.39 1.96-3.39-1.96 3.39-1.96z"
          />
        </svg>
      );

    case "AVAX":
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={cn("shrink-0 rounded-full", className)}
          aria-label="Avalanche"
        >
          <circle cx="16" cy="16" r="16" fill="#E84142" />
          <path
            fill="#FFFFFF"
            d="M17.48 8.44a1.72 1.72 0 00-2.96 0l-8.08 14.1a1.72 1.72 0 001.48 2.57h5.18a1.72 1.72 0 001.48-.86l5.02-8.75 2.12 3.7a1.72 1.72 0 001.48.86h3.36a1.72 1.72 0 001.48-2.57l-10.56-9.05zm-1.48 3.5l5.24 9.15h-10.48l5.24-9.15z"
          />
        </svg>
      );

    case "ARB":
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={cn("shrink-0 rounded-full", className)}
          aria-label="Arbitrum"
        >
          <circle cx="16" cy="16" r="16" fill="#28A0F0" />
          <path
            fill="#FFFFFF"
            d="M16 6.5l-8.5 14.7 3.2 1.8 5.3-9.2 5.3 9.2 3.2-1.8L16 6.5zm-3.8 14.5l3.8-6.6 3.8 6.6H12.2z"
          />
        </svg>
      );

    case "BASE":
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={cn("shrink-0 rounded-full", className)}
          aria-label="Base"
        >
          <circle cx="16" cy="16" r="16" fill="#0052FF" />
          <circle cx="16" cy="16" r="8" fill="#FFFFFF" />
          <circle cx="16" cy="16" r="5" fill="#0052FF" />
        </svg>
      );

    case "OP":
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={cn("shrink-0 rounded-full", className)}
          aria-label="Optimism"
        >
          <circle cx="16" cy="16" r="16" fill="#FF0420" />
          <path
            fill="#FFFFFF"
            d="M12.5 11c-2.8 0-4.5 2.2-4.5 5s1.7 5 4.5 5 4.5-2.2 4.5-5-1.7-5-4.5-5zm0 7.8c-1.5 0-2.3-1.2-2.3-2.8s.8-2.8 2.3-2.8 2.3 1.2 2.3 2.8-.8 2.8-2.3 2.8zm7.5-7.8h-2.5v10h2.5c2.5 0 4-1.5 4-4s-1.5-4-4-4zm0 6h-.5v-4h.5c1.2 0 1.8.8 1.8 2s-.6 2-1.8 2z"
          />
        </svg>
      );

    case "XRP":
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={cn("shrink-0 rounded-full", className)}
          aria-label="XRP"
        >
          <circle cx="16" cy="16" r="16" fill="#23292F" />
          <path
            fill="#FFFFFF"
            d="M23.5 9.5l-2.4-2.4-5.1 5.1-5.1-5.1-2.4 2.4 7.5 7.5-7.5 7.5 2.4 2.4 5.1-5.1 5.1 5.1 2.4-2.4-7.5-7.5 7.5-7.5z"
          />
        </svg>
      );

    case "DOGE":
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={cn("shrink-0 rounded-full", className)}
          aria-label="Dogecoin"
        >
          <circle cx="16" cy="16" r="16" fill="#C2A633" />
          <path
            fill="#FFFFFF"
            d="M13.5 9h4c4.1 0 6.5 2.9 6.5 7s-2.4 7-6.5 7h-4V9zm3 3v2.5h-1V12h1zm3 8c2.2 0 3.5-1.6 3.5-4s-1.3-4-3.5-4h-2v8h2zm-3-4.5v-2.5h-1v2.5h1z"
          />
        </svg>
      );

    default:
      return (
        <div
          style={{ width: size, height: size }}
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-primary/20 font-heading text-xs font-bold text-primary",
            className,
          )}
        >
          {s.slice(0, 3)}
        </div>
      );
  }
}
