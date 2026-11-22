"use client";

import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PinBoxesInputProps {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  /** Default masked (dots) with optional show/hide toggle. */
  defaultVisible?: boolean;
}

export function PinBoxesInput({
  id = "transaction-pin",
  value,
  onChange,
  disabled = false,
  defaultVisible = false,
}: PinBoxesInputProps) {
  const [visible, setVisible] = useState(defaultVisible);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 4 }, (_, idx) => value[idx] ?? "");

  const updateDigit = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (!clean) {
      const next = [...digits];
      next[index] = "";
      onChange(next.join(""));
      return;
    }

    // Handle typing or pasting multiple digits
    const next = [...digits];
    let cursor = index;
    for (const ch of clean) {
      if (cursor >= 4) break;
      next[cursor] = ch;
      cursor += 1;
    }
    onChange(next.join(""));
    const focusIdx = Math.min(cursor, 3);
    refs.current[focusIdx]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        onChange(next.join(""));
        e.preventDefault();
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        onChange(next.join(""));
        refs.current[index - 1]?.focus();
        e.preventDefault();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    refs.current[Math.min(pasted.length, 3)]?.focus();
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2.5">
        {digits.map((digit, index) => (
          <input
            key={index}
            id={index === 0 ? id : `${id}-${index}`}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type={visible ? "text" : "password"}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={4}
            disabled={disabled}
            value={digit}
            onChange={(e) => updateDigit(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.currentTarget.select()}
            aria-label={`Transaction PIN digit ${index + 1}`}
            className={cn(
              "size-12 rounded-xl border border-input bg-background text-center font-mono text-lg font-semibold shadow-xs transition-colors outline-none",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              digit && "border-primary/60",
            )}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? "Hide PIN" : "Show PIN"}
        title={visible ? "Hide PIN" : "Show PIN"}
        className="inline-flex size-10 items-center justify-center rounded-xl border border-input bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
