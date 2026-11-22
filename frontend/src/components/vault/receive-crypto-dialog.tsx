"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { AlertCircle, Check, Copy, Share2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/shared/responsive-modal";
import { Button } from "@/components/ui/button";
import type { VaultWallet } from "@/types/vault";
import { CryptoIcon } from "./crypto-icon";

interface ReceiveCryptoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: VaultWallet | undefined | null;
}

export function ReceiveCryptoDialog({ open, onOpenChange, wallet }: ReceiveCryptoDialogProps) {
  const [copied, setCopied] = useState(false);
  const [qrSvg, setQrSvg] = useState<string>("");

  // Network stated by Admin - user follows this without network choosing
  const designatedNetwork = wallet?.designatedNetwork || "Ethereum";
  const lowerNet = designatedNetwork.toLowerCase();

  // If admin explicitly set a custom designated address for this chain, use it directly!
  // Otherwise resolve to the wallet's respective chain address.
  let address = wallet?.designatedAddress || wallet?.evmAddress || "0x71C8409391E606cD20689eB4D8D2513f5c8893B9";
  let symbol = "ETH";
  let standard = "ERC-20";

  if (lowerNet.includes("solana") || lowerNet.includes("sol")) {
    address = wallet?.designatedAddress || wallet?.solanaAddress || "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusV4K1";
    symbol = "SOL";
    standard = "SPL Token";
  } else if (lowerNet.includes("bitcoin") || lowerNet.includes("btc")) {
    address = wallet?.designatedAddress || wallet?.bitcoinAddress || "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
    symbol = "BTC";
    standard = "Native SegWit";
  } else if (lowerNet.includes("tron") || lowerNet.includes("trc")) {
    address = wallet?.designatedAddress || "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
    symbol = "USDT";
    standard = "TRC-20";
  } else if (lowerNet.includes("bnb") || lowerNet.includes("binance") || lowerNet.includes("bep")) {
    address = wallet?.designatedAddress || wallet?.evmAddress || "0x71C8409391E606cD20689eB4D8D2513f5c8893B9";
    symbol = "BNB";
    standard = "BEP-20";
  } else if (lowerNet.includes("polygon") || lowerNet.includes("matic") || lowerNet.includes("pol")) {
    address = wallet?.designatedAddress || wallet?.evmAddress || "0x71C8409391E606cD20689eB4D8D2513f5c8893B9";
    symbol = "POL";
    standard = "PoS Network";
  } else if (lowerNet.includes("arbitrum")) {
    address = wallet?.designatedAddress || wallet?.evmAddress || "0x71C8409391E606cD20689eB4D8D2513f5c8893B9";
    symbol = "ARB";
    standard = "Arbitrum One";
  } else if (lowerNet.includes("base")) {
    address = wallet?.designatedAddress || wallet?.evmAddress || "0x71C8409391E606cD20689eB4D8D2513f5c8893B9";
    symbol = "BASE";
    standard = "Base L2";
  } else if (lowerNet.includes("avalanche") || lowerNet.includes("avax")) {
    address = wallet?.designatedAddress || wallet?.evmAddress || "0x71C8409391E606cD20689eB4D8D2513f5c8893B9";
    symbol = "AVAX";
    standard = "Avalanche C-Chain";
  } else if (lowerNet.includes("doge")) {
    address = wallet?.designatedAddress || "DMpdh7x9mK9q8n6wzP4yRt1kG5vJ2b8aC";
    symbol = "DOGE";
    standard = "Dogecoin";
  } else if (lowerNet.includes("litecoin") || lowerNet.includes("ltc")) {
    address = wallet?.designatedAddress || "ltc1qrg9a5l5z3u3s3m7p8q4r8e2w9k0x1y4";
    symbol = "LTC";
    standard = "Litecoin";
  } else if (lowerNet.includes("xrp") || lowerNet.includes("ripple")) {
    address = wallet?.designatedAddress || "rEb8TK3gBgk5auZyyb6BiHgj46epSZq32n";
    symbol = "XRP";
    standard = "XRP Ledger";
  } else {
    // Custom network: if designatedAddress is present, use it directly!
    if (wallet?.designatedAddress) {
      address = wallet.designatedAddress;
    }
    standard = "Mainnet";
    symbol = "ETH";
  }

  // Generate real, 100% scannable QR code with high error correction for designated address
  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    QRCode.toString(address, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "H",
      color: {
        dark: "#0a0a0c",
        light: "#ffffff",
      },
    })
      .then((svg) => {
        if (!cancelled) {
          setQrSvg(svg.replace(/<\?xml.*?\?>/, ""));
        }
      })
      .catch((err) => {
        console.error("Failed to generate QR code", err);
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success(`${designatedNetwork} address copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy address");
    }
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} desktop="dialog">
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Deposit Address</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Scan or copy your deposit address. Ensure you send funds via the required network below.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="flex flex-col items-center gap-5 pt-2 text-center">
          {/* Admin Designated Network Badge (Strictly enforced, no user network selector) */}
          <div className="flex w-full items-center justify-between rounded-xl border border-border/80 bg-muted/40 p-3 text-left">
            <div className="flex items-center gap-3">
              <CryptoIcon symbol={symbol} size={28} />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">
                    {designatedNetwork}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ({standard})
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Admin Stated Deposit Network
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
              <ShieldCheck className="size-3" />
              <span>Required</span>
            </span>
          </div>

          {/* Real Dynamic QR Code Container */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-white p-4 shadow-sm dark:bg-white">
            <div className="relative size-48 sm:size-52 flex items-center justify-center">
              {qrSvg ? (
                <div
                  className="size-full [&>svg]:size-full [&>svg]:h-auto [&>svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : (
                <div className="size-full animate-pulse rounded-xl bg-neutral-100" />
              )}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-white p-1 shadow-sm border border-neutral-200">
                  <CryptoIcon symbol={symbol} size={28} />
                </div>
              </div>
            </div>
          </div>

          {/* Address Display & Copy */}
          <div className="w-full text-left">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-muted-foreground font-medium">
                {designatedNetwork} Deposit Address
              </p>
              <span className="text-[10px] text-muted-foreground font-mono uppercase">
                {standard}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/40 p-3 text-left">
              <span className="break-all font-mono text-xs text-foreground select-all leading-relaxed">
                {address}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex w-full items-center gap-3">
            <Button
              onClick={handleCopy}
              className="bg-primary flex-1 h-11 rounded-xl font-bold text-white hover:opacity-95"
            >
              {copied ? <Check className="size-4 mr-1.5" /> : <Copy className="size-4 mr-1.5" />}
              {copied ? "Copied" : "Copy Address"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.share?.({ title: `${designatedNetwork} Deposit Address`, text: address }).catch(() => handleCopy());
              }}
              className="h-11 rounded-xl px-4"
            >
              <Share2 className="size-4" />
            </Button>
          </div>

          {/* Warning Notice */}
          <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-left text-xs text-amber-600 dark:text-amber-400">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>
              Only send assets via the <strong>{designatedNetwork}</strong> ({standard}) network to this address. Sending funds via any other blockchain or network may result in permanent loss.
            </span>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
