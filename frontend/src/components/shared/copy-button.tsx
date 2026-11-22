"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  /** Names the thing being copied, e.g. "Account number". */
  label: string;
  /** Show the label next to the icon instead of an icon-only button. */
  withText?: boolean;
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

export function CopyButton({ value, label, withText = false, variant = "ghost", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Select the text and copy it manually.");
    }
  }

  if (withText) {
    return (
      <Button type="button" variant={variant} onClick={copy} className={className}>
        {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
        {copied ? "Copied" : label}
      </Button>
    );
  }
  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      onClick={copy}
      aria-label={`Copy ${label.toLowerCase()}`}
      className={cn(copied && "text-credit", className)}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  );
}
