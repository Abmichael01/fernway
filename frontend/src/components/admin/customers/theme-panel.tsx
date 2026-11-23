"use client";

import { useState } from "react";
import { Check, Palette } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { PREDEFINED_THEMES, type AppTheme } from "@/config/themes";
import { useUpdateCustomer } from "@/hooks/admin/useAdminCustomers";
import type { AdminCustomer } from "@/types/admin";

interface ThemePanelProps {
  customer: AdminCustomer;
}

export function ThemePanel({ customer }: ThemePanelProps) {
  const [selectedThemeId, setSelectedThemeId] = useState(customer.theme || "fernway-ember");
  const updateCustomerMutation = useUpdateCustomer(customer.id);

  const handleApplyTheme = (theme: AppTheme) => {
    setSelectedThemeId(theme.id);
    updateCustomerMutation.mutate(
      {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        addressLine1: customer.addressLine1,
        city: customer.city,
        state: customer.state,
        postalCode: customer.postalCode,
        disabled: customer.disabled,
        theme: theme.id,
      },
      {
        onSuccess: () => {
          toast.success(`Theme updated to ${theme.name} for ${customer.firstName}!`);
        },
        onError: () => {
          toast.error("Failed to update user theme.");
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-card p-5">
        <div className="flex items-center gap-2">
          <Palette className="size-5 text-primary" />
          <h3 className="font-heading text-lg font-bold text-foreground">
            Customer Interface Theme
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
          Choose which visual color theme this customer experiences across both Lindenway Banking and Lindenway Vault. Selected theme applies dynamically across all their sessions.
        </p>
      </div>

      {/* 10 Predefined Themes Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {PREDEFINED_THEMES.map((theme) => {
          const isSelected = selectedThemeId === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleApplyTheme(theme)}
              className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Gradient Swatch */}
                    <span
                      className="size-7 rounded-xl shadow-xs"
                      style={{ background: theme.gradient }}
                    />
                    <div>
                      <h4 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {theme.name}
                      </h4>
                    </div>
                  </div>

                  {isSelected ? (
                    <Badge className="bg-primary text-white border-none text-[10px] gap-1">
                      <Check className="size-3" />
                      <span>Active</span>
                    </Badge>
                  ) : (
                    <span className="text-[11px] font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to activate
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {theme.tagline}
                </p>
              </div>

              {/* Color Chips preview */}
              <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                <span className="text-[10px] text-muted-foreground">Color Palette</span>
                <div className="flex items-center gap-1.5">
                  {theme.previewColors.map((col, idx) => (
                    <span
                      key={idx}
                      className="size-3.5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: col }}
                      title={col}
                    />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
