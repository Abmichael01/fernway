import type {
  BankLookup,
  MinorUnits,
  Recipient,
  Transaction,
  TransferMethod,
  TransferQuote,
  TransferRequest,
} from "@/types/banking";
import { apiRequest } from "./client";

export function getRecipients(): Promise<Recipient[]> {
  return apiRequest<Recipient[]>("/recipients");
}

export function lookupRoutingNumber(routingNumber: string): Promise<BankLookup> {
  return apiRequest<BankLookup>(`/banks?routing=${encodeURIComponent(routingNumber)}`);
}

export function getTransferQuote(method: TransferMethod, amount: MinorUnits): Promise<TransferQuote> {
  return apiRequest<TransferQuote>(`/transfers/quote?method=${method}&amount=${amount}`);
}

export interface SimpleTransferRequest {
  recipientName: string;
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  amount: MinorUnits;
  memo?: string;
  pin: string;
}

export function sendTransfer(request: TransferRequest | SimpleTransferRequest): Promise<Transaction> {
  return apiRequest<Transaction>("/transfers", { method: "POST", body: request });
}
