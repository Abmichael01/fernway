"use client";

import { type ReactNode, useId, useState } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { Controller, type Control, type FieldPath, type FieldValues, type UseFormSetError } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

/** Small RHF + shadcn Field wrappers so the admin forms stay short and consistent. */

interface BaseProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: ReactNode;
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  type = "text",
  placeholder,
  autoComplete = "off",
  max,
}: BaseProps<T> & { type?: string; placeholder?: string; autoComplete?: string; max?: string }) {
  const id = `${useId()}-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input
            {...field}
            value={field.value ?? ""}
            id={id}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            max={max}
            aria-invalid={fieldState.invalid}
            className="h-10"
          />
          {description && !fieldState.invalid && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

export function MoneyField<T extends FieldValues>({ control, name, label, description }: BaseProps<T>) {
  const id = `${useId()}-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <InputGroup className="h-10">
            <InputGroupAddon>
              <InputGroupText>$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              {...field}
              value={field.value ?? ""}
              id={id}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              aria-invalid={fieldState.invalid}
              onChange={(event) => field.onChange(event.target.value.replace(/[^\d.,]/g, ""))}
              className="tabular-nums"
            />
          </InputGroup>
          {description && !fieldState.invalid && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  options,
  placeholder = "Choose…",
}: BaseProps<T> & { options: Array<{ value: string; label: string }>; placeholder?: string }) {
  const id = `${useId()}-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Select value={field.value || undefined} onValueChange={field.onChange}>
            <SelectTrigger id={id} aria-invalid={fieldState.invalid} className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && !fieldState.invalid && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

export function SwitchField<T extends FieldValues>({ control, name, label, description }: BaseProps<T>) {
  const id = `${useId()}-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field orientation="horizontal" data-invalid={fieldState.invalid} className="items-start justify-between gap-4 rounded-md border p-3.5">
          <div className="flex flex-col gap-0.5">
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={[fieldState.error]} />
          </div>
          <Switch id={id} checked={Boolean(field.value)} onCheckedChange={field.onChange} />
        </Field>
      )}
    />
  );
}

/** Password input with "generate" and show/hide buttons. Generated passwords start visible. */
export function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  onGenerate,
}: BaseProps<T> & { onGenerate: () => void }) {
  const id = `${useId()}-${name}`;
  const [visible, setVisible] = useState(true);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <InputGroup className="h-10">
            <InputGroupInput
              {...field}
              value={field.value ?? ""}
              id={id}
              type={visible ? "text" : "password"}
              autoComplete="new-password"
              spellCheck={false}
              aria-invalid={fieldState.invalid}
              className="font-heading tabular-nums"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setVisible((value) => !value)}
                aria-label={visible ? "Hide password" : "Show password"}
              >
                {visible ? <EyeOff /> : <Eye />}
              </InputGroupButton>
              <InputGroupButton
                size="xs"
                // Keep focus where it is, so the click isn't lost to a blur-triggered re-render.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onGenerate();
                  setVisible(true);
                }}
              >
                <RefreshCw /> Generate
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {description && !fieldState.invalid && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

/** Maps API field errors onto the form so they show inline. */
export function applyFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors: Record<string, string>,
  fallback: string,
) {
  const entries = Object.entries(fieldErrors);
  if (entries.length === 0) {
    setError("root", { message: fallback });
    return;
  }
  for (const [key, message] of entries) setError(key as FieldPath<T>, { message });
}
