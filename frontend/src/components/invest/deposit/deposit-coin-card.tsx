"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import { CoinIcon } from "@/components/shared/coin-icon";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useCreateDepositAddress } from "@/hooks/invest/useCreateDepositAddress";
import { formatQuantity } from "@/lib/crypto";
import type { DepositCoin } from "@/types/invest";

export function DepositCoinCard({ coin }: { coin: DepositCoin }) {
  const create = useCreateDepositAddress();
  const feePercent = (coin.feeRate * 100).toLocaleString("en-US", { maximumFractionDigits: 2 });

  function getAddress() {
    create.mutate(coin.symbol, {
      onError: (error) => toast.error(error instanceof ApiError ? error.message : "We couldn't create the address. Try again."),
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CoinIcon symbol={coin.symbol} />
          <div>
            <CardTitle className="font-heading text-base font-semibold">{coin.name}</CardTitle>
            <CardDescription>{coin.network}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Minimum</dt>
            <dd className="font-medium tabular-nums">{formatQuantity(coin.minimum, coin.symbol)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Gateway fee</dt>
            <dd className="font-medium tabular-nums">About {feePercent}%</dd>
          </div>
        </dl>
        {coin.address ? (
          <AddressBlock coin={coin} feePercent={feePercent} />
        ) : (
          <Button onClick={getAddress} disabled={create.isPending} className="h-11">
            {create.isPending && <Spinner data-icon="inline-start" />}
            Get my deposit address
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function AddressBlock({ coin, feePercent }: { coin: DepositCoin; feePercent: string }) {
  const address = coin.address ?? "";
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(address, { margin: 1, width: 220 })
      .then((url) => !cancelled && setQr(url))
      .catch(() => !cancelled && setQr(null));
    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        {qr && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt={`QR code for your ${coin.name} deposit address`} width={132} height={132} className="size-[132px] shrink-0 rounded-md border bg-white p-1" />
        )}
        <div className="flex w-full min-w-0 flex-col gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Your {coin.symbol} address</p>
          <p className="rounded-md border bg-muted/50 p-3 font-mono text-xs break-all">{address}</p>
          <CopyButton value={address} label="Address" withText variant="outline" className="w-full sm:w-fit" />
        </div>
      </div>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-xs text-muted-foreground">
        <li>
          Send only {coin.name} on the {coin.network}. Anything else sent here is lost.
        </li>
        <li>
          Amounts under {formatQuantity(coin.minimum, coin.symbol)} are lost.
        </li>
        <li>The payment gateway keeps about {feePercent}% of each deposit.</li>
        <li>Your investing cash goes up once the network confirms the payment, at the market price at that moment.</li>
      </ul>
    </div>
  );
}
