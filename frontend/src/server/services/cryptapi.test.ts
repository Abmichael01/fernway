import { createSign, generateKeyPairSync } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { parseCallback, verifyCallbackSignature, CRYPTAPI_PUBLIC_KEY } = await import("./cryptapi");

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 1024 });
const testKey = publicKey.export({ type: "spki", format: "pem" }).toString();

function sign(body: string): string {
  const signer = createSign("RSA-SHA256");
  signer.update(body);
  return signer.sign(privateKey).toString("base64");
}

const body =
  "uuid=dbfcb40e-5a6b-4305-9fa2-b0fbda6e3ff2&address_in=3PFoGK63cVVUWnd2vu7W1kM83NXUfvzMqM&address_out=1H6ZZpRmMnrw8ytepV3BYwMjYYnEkWDqVP&txid_in=a2174ffd&txid_out=b3285&value_coin=0.05&value_forwarded_coin=0.0495&fee_coin=0.0005&confirmations=3&pending=0&coin=btc";

describe("verifyCallbackSignature", () => {
  it("accepts a body signed with the matching key", () => {
    expect(verifyCallbackSignature(body, sign(body), testKey)).toBe(true);
  });

  it("rejects a tampered body, a missing header and the wrong key", () => {
    expect(verifyCallbackSignature(body.replace("0.05", "5.00"), sign(body), testKey)).toBe(false);
    expect(verifyCallbackSignature(body, null, testKey)).toBe(false);
    expect(verifyCallbackSignature(body, "not base64 !!", testKey)).toBe(false);
    // Signed by us, so CryptAPI's real key must refuse it.
    expect(verifyCallbackSignature(body, sign(body), CRYPTAPI_PUBLIC_KEY)).toBe(false);
  });
});

describe("parseCallback", () => {
  it("reads a confirmed payment", () => {
    expect(parseCallback(body)).toMatchObject({
      uuid: "dbfcb40e-5a6b-4305-9fa2-b0fbda6e3ff2",
      pending: false,
      valueCoin: "0.05",
      forwardedCoin: "0.0495",
      feeCoin: "0.0005",
      confirmations: 3,
    });
  });

  it("refuses malformed values", () => {
    expect(parseCallback(body.replace("value_coin=0.05", "value_coin=-1"))).toBeNull();
    expect(parseCallback(body.replace("pending=0", "pending=maybe"))).toBeNull();
    expect(parseCallback("value_coin=1&pending=0")).toBeNull();
  });
});
