"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/shared/responsive-modal";
import { generateSeedPhrase, validateSeedPhrase } from "@/lib/mnemonic";
import { useCreateWallet } from "@/hooks/vault/useVault";

interface AddWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWalletCreated?: (newWalletId: string) => void;
}

export function AddWalletModal({ open, onOpenChange, onWalletCreated }: AddWalletModalProps) {
  const createWalletMutation = useCreateWallet();

  const [mode, setMode] = useState<"choice" | "create" | "import">("choice");
  const [walletName, setWalletName] = useState("DeFi Vault");

  // Create Flow State
  const [createStep, setCreateStep] = useState<"name" | "phrase" | "verify">("name");
  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [backedUpAcknowledged, setBackedUpAcknowledged] = useState(false);
  const [revealed, setRevealed] = useState(true);

  // Verification challenge state (pick 3 random indexes: 0-indexed)
  const [verifyIndices, setVerifyIndices] = useState<number[]>([2, 6, 10]); // e.g. 3rd, 7th, 11th word
  const [selectedVerifyWords, setSelectedVerifyWords] = useState<Record<number, string>>({});
  const [scrambledOptions, setScrambledOptions] = useState<string[]>([]);

  // Import Flow State
  const [importPhrase, setImportPhrase] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const startCreateFlow = () => {
    const words = generateSeedPhrase(12);
    setSeedWords(words);
    setWalletName(`Vault Wallet ${Math.floor(Math.random() * 899 + 100)}`);
    setCreateStep("phrase");
    setMode("create");
    setBackedUpAcknowledged(false);

    // Setup verification test
    const idx1 = Math.floor(Math.random() * 4); // 0-3
    const idx2 = 4 + Math.floor(Math.random() * 4); // 4-7
    const idx3 = 8 + Math.floor(Math.random() * 4); // 8-11
    setVerifyIndices([idx1, idx2, idx3]);
    setSelectedVerifyWords({});

    // Scramble target words plus some distractors
    const targetWords = [words[idx1], words[idx2], words[idx3]];
    const otherWords = words.filter((w) => !targetWords.includes(w)).slice(0, 5);
    const combined = [...targetWords, ...otherWords].sort(() => 0.5 - Math.random());
    setScrambledOptions(combined);
  };

  const startImportFlow = () => {
    setWalletName("Imported Vault");
    setImportPhrase("");
    setImportError(null);
    setMode("import");
  };

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(seedWords.join(" "));
    toast.success("12-word seed phrase copied to clipboard");
  };

  const handleProceedToVerify = () => {
    if (!backedUpAcknowledged) {
      toast.error("Please acknowledge that you have safely stored your recovery phrase.");
      return;
    }
    setCreateStep("verify");
  };

  const handleSelectWord = (targetIndex: number, word: string) => {
    setSelectedVerifyWords((prev) => ({
      ...prev,
      [targetIndex]: word,
    }));
  };

  const isVerificationComplete =
    verifyIndices.every((idx) => selectedVerifyWords[idx] !== undefined) &&
    verifyIndices.every((idx) => selectedVerifyWords[idx] === seedWords[idx]);

  const handleFinishCreate = async () => {
    if (!isVerificationComplete) {
      toast.error("Seed phrase verification incomplete or incorrect. Please select the right words.");
      return;
    }

    try {
      const res = await createWalletMutation.mutateAsync({
        name: walletName,
        phrase: seedWords.join(" "),
      });
      toast.success(`Wallet "${walletName}" created & secured!`);
      onOpenChange(false);
      resetState();
      onWalletCreated?.(res.wallet.id);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create wallet");
    }
  };

  const handleFinishImport = async () => {
    const val = validateSeedPhrase(importPhrase);
    if (!val.valid) {
      setImportError(val.error || "Invalid seed phrase");
      return;
    }

    try {
      const res = await createWalletMutation.mutateAsync({
        name: walletName,
        phrase: importPhrase.trim(),
      });
      toast.success(`Wallet "${walletName}" imported successfully!`);
      onOpenChange(false);
      resetState();
      onWalletCreated?.(res.wallet.id);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to import wallet");
    }
  };

  const resetState = () => {
    setMode("choice");
    setCreateStep("name");
    setSeedWords([]);
    setSelectedVerifyWords({});
    setImportPhrase("");
    setImportError(null);
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) resetState();
      }}
    >
      <ResponsiveModalContent className="max-w-md sm:max-w-lg p-6">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-2">
            {mode !== "choice" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                onClick={() => setMode("choice")}
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <span className="bg-vault-gradient grid size-8 place-items-center rounded-xl text-white">
                <ShieldCheck className="size-4" />
              </span>
              <ResponsiveModalTitle className="font-heading text-lg font-bold">
                {mode === "choice"
                  ? "Add Wallet"
                  : mode === "create"
                    ? "Create New Multi-Chain Wallet"
                    : "Import Existing Wallet"}
              </ResponsiveModalTitle>
            </div>
          </div>
          <ResponsiveModalDescription className="text-xs text-muted-foreground mt-1">
            {mode === "choice"
              ? "Trust Wallet multi-chain self-custody. Add or restore wallets instantly."
              : mode === "create"
                ? "Generate and verify your 12-word secret recovery phrase."
                : "Restore your assets using your 12 or 24-word secret recovery phrase."}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {/* 1. Choice View */}
        {mode === "choice" && (
          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={startCreateFlow}
              className="group flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-4 text-left transition-all hover:border-primary hover:bg-muted/30 active:scale-[0.99]"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Plus className="size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-bold text-foreground">
                    Create a New Wallet
                  </span>
                  <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
                    Recommended
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generate a fresh 12-word secret recovery phrase for multi-chain assets (EVM, Solana, Bitcoin).
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={startImportFlow}
              className="group flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-4 text-left transition-all hover:border-primary hover:bg-muted/30 active:scale-[0.99]"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                <KeyRound className="size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <span className="font-heading text-sm font-bold text-foreground">
                  I Already Have a Wallet
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Import existing Trust Wallet, MetaMask, or Phantom 12/24-word secret recovery phrase.
                </p>
              </div>
            </button>
          </div>
        )}

        {/* 2. Create Flow - Phrase Display */}
        {mode === "create" && createStep === "phrase" && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Wallet Name</Label>
              <Input
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="e.g. DeFi Vault 1"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="size-4 shrink-0" />
                <span>Write Down Secret Recovery Phrase</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Do not share this phrase with anyone. Store it safely offline. Lindenway Vault cannot recover lost phrases.
              </p>
            </div>

            {/* Seed Phrase Grid */}
            <div className="relative rounded-2xl border border-border/80 bg-muted/40 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-xs font-semibold text-muted-foreground">
                  12-Word Recovery Phrase
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRevealed(!revealed)}
                    className="h-7 gap-1 px-2 text-xs"
                  >
                    {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    <span>{revealed ? "Hide" : "Show"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPhrase}
                    className="h-7 gap-1 px-2 text-xs"
                  >
                    <Copy className="size-3.5" />
                    <span>Copy</span>
                  </Button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {seedWords.map((word, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1.5 text-xs font-mono"
                  >
                    <span className="text-[10px] text-muted-foreground w-4 text-right">
                      {idx + 1}.
                    </span>
                    <span className="font-semibold text-foreground">
                      {revealed ? word : "••••••"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acknowledgment */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-muted-foreground select-none">
              <input
                type="checkbox"
                checked={backedUpAcknowledged}
                onChange={(e) => setBackedUpAcknowledged(e.target.checked)}
                className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>
                I have written down or safely backed up my 12-word recovery phrase and understand I will verify it next.
              </span>
            </label>

            <Button
              onClick={handleProceedToVerify}
              disabled={!backedUpAcknowledged}
              className="mt-2 h-11 w-full rounded-xl font-bold"
            >
              Verify Recovery Phrase
            </Button>
          </div>
        )}

        {/* 2. Create Flow - Verify Step */}
        {mode === "create" && createStep === "verify" && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">Seed Phrase Verification</span>
              <p className="mt-1 text-[11px] leading-relaxed">
                Trust Wallet security check: Select the correct words below to verify you saved your phrase.
              </p>
            </div>

            {/* Challenges */}
            <div className="flex flex-col gap-3">
              {verifyIndices.map((wordIdx) => {
                const targetWord = seedWords[wordIdx];
                const selected = selectedVerifyWords[wordIdx];
                const isCorrect = selected === targetWord;

                return (
                  <div key={wordIdx} className="flex flex-col gap-1.5 rounded-2xl border border-border/70 bg-card p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">
                        Word #{wordIdx + 1}:
                      </span>
                      {selected ? (
                        <span
                          className={`flex items-center gap-1 font-mono font-bold ${
                            isCorrect ? "text-emerald-500" : "text-destructive"
                          }`}
                        >
                          {isCorrect ? <Check className="size-3.5" /> : "Incorrect"}
                          <span>{selected}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Select below</span>
                      )}
                    </div>

                    {/* Word choices for this slot */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {scrambledOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectWord(wordIdx, opt)}
                          className={`rounded-lg px-3 py-1 text-xs font-mono transition-colors ${
                            selected === opt
                              ? "bg-primary text-white font-bold"
                              : "border border-border/60 bg-muted/60 text-foreground hover:border-primary"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={handleFinishCreate}
              disabled={!isVerificationComplete || createWalletMutation.isPending}
              className="mt-2 h-11 w-full rounded-xl font-bold gap-2"
            >
              {createWalletMutation.isPending ? (
                <span>Securing Wallet...</span>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  <span>Confirm & Activate Wallet</span>
                </>
              )}
            </Button>
          </div>
        )}

        {/* 3. Import Flow */}
        {mode === "import" && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Wallet Name</Label>
              <Input
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="e.g. My Imported Vault"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Secret Recovery Phrase or Address</Label>
                <span className="text-[10px] text-muted-foreground">12/24 words or 0x...</span>
              </div>
              <Textarea
                rows={4}
                value={importPhrase}
                onChange={(e) => {
                  setImportPhrase(e.target.value);
                  setImportError(null);
                }}
                placeholder="Paste your 12 or 24-word secret recovery phrase, or enter an Ethereum address (0x...)"
                className="rounded-xl font-mono text-xs resize-none"
              />
              {importError && (
                <span className="text-[11px] font-medium text-destructive">{importError}</span>
              )}
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
              <Lock className="size-3.5 inline mr-1 text-primary" />
              Your keys and addresses are securely connected. Live on-chain balances are queried in real time via Infura / Ethereum RPC.
            </div>

            <Button
              onClick={handleFinishImport}
              disabled={!importPhrase.trim() || createWalletMutation.isPending}
              className="mt-2 h-11 w-full rounded-xl font-bold gap-2"
            >
              {createWalletMutation.isPending ? (
                <span>Importing Wallet...</span>
              ) : (
                <>
                  <KeyRound className="size-4" />
                  <span>Restore & Import Wallet</span>
                </>
              )}
            </Button>
          </div>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
