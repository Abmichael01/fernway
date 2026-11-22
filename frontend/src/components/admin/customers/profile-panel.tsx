"use client";

import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import { applyFieldErrors, SwitchField, TextField } from "@/components/admin/shared/form-fields";
import { SignInDetails } from "@/components/admin/shared/sign-in-details";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useSetCustomerPassword, useUpdateCustomer } from "@/hooks/admin/useAdminCustomers";
import { generatePassword } from "@/lib/password";
import { type CustomerUpdateValues, customerUpdateSchema } from "@/schemas/admin";
import type { AdminCustomer } from "@/types/admin";

const valuesFrom = (customer: AdminCustomer): CustomerUpdateValues => ({
  firstName: customer.firstName,
  lastName: customer.lastName,
  email: customer.email,
  phone: customer.phone,
  addressLine1: customer.addressLine1,
  city: customer.city,
  state: customer.state,
  postalCode: customer.postalCode,
  disabled: customer.disabled,
});

export function ProfilePanel({ customer }: { customer: AdminCustomer }) {
  const updateCustomer = useUpdateCustomer(customer.id);
  const form = useForm<CustomerUpdateValues>({ resolver: zodResolver(customerUpdateSchema), defaultValues: valuesFrom(customer), mode: "onTouched" });
  const { reset } = form;

  useEffect(() => reset(valuesFrom(customer)), [customer, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateCustomer.mutateAsync(values);
      toast.success("Profile saved");
    } catch (error) {
      if (error instanceof ApiError) applyFieldErrors(form.setError, error.fieldErrors, error.message);
      else form.setError("root", { message: "We couldn't reach the server. Try again." });
    }
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6 rounded-md border p-5 sm:p-6">
        <FieldGroup className="gap-6">
          <FieldSet>
            <FieldLegend>Contact</FieldLegend>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="firstName" label="First name" />
              <TextField control={form.control} name="lastName" label="Last name" />
              <TextField control={form.control} name="email" label="Email" type="email" />
              <TextField control={form.control} name="phone" label="Phone" type="tel" />
            </div>
          </FieldSet>
          <FieldSet>
            <FieldLegend>Address</FieldLegend>
            <TextField control={form.control} name="addressLine1" label="Street address" />
            <div className="grid grid-cols-[1fr_5rem_7rem] gap-3">
              <TextField control={form.control} name="city" label="City" />
              <TextField control={form.control} name="state" label="State" />
              <TextField control={form.control} name="postalCode" label="ZIP" />
            </div>
          </FieldSet>
          <SwitchField
            control={form.control}
            name="disabled"
            label="Disable sign-in"
            description="Signs them out everywhere. Their accounts and history are kept."
          />
        </FieldGroup>
        {form.formState.errors.root && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <div>
          <Button type="submit" size="lg" disabled={updateCustomer.isPending || !form.formState.isDirty}>
            {updateCustomer.isPending && <Spinner data-icon="inline-start" />}
            {updateCustomer.isPending ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
      <PasswordReset customer={customer} />
    </div>
  );
}

/** Sets a new password and shows the sign-in details once, to copy and send to the customer. */
function PasswordReset({ customer }: { customer: AdminCustomer }) {
  const passwordId = useId();
  const setPassword = useSetCustomerPassword(customer.id);
  const [password, setValue] = useState("");
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPassword.mutate(password, {
      onSuccess: () => {
        setSaved(password);
        setValue("");
        toast.success(`New password set. ${customer.firstName} was signed out everywhere.`);
      },
      onError: (failure) =>
        setError(failure instanceof ApiError ? (failure.fieldErrors.password ?? failure.message) : "We couldn't reach the server."),
    });
  };

  return (
    <div className="flex h-fit flex-col gap-4 rounded-md border p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="bg-brand-gradient grid size-9 place-items-center rounded-full text-white">
          <KeyRound className="size-4" aria-hidden="true" />
        </span>
        <h3 className="font-heading font-semibold">{saved ? "New sign-in details" : "Set a new password"}</h3>
      </div>
      {saved ? (
        <>
          <SignInDetails name={customer.firstName} email={customer.email} password={saved} />
          <Button variant="outline" onClick={() => setSaved(null)}>
            Done
          </Button>
        </>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor={passwordId}>New password</FieldLabel>
            <InputGroup className="h-10">
              <InputGroupInput
                id={passwordId}
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                spellCheck={false}
                value={password}
                onChange={(event) => setValue(event.target.value)}
                aria-invalid={Boolean(error)}
                className="font-heading tabular-nums"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  onClick={() => setVisible((value) => !value)}
                  aria-label={visible ? "Hide password" : "Show password"}
                >
                  {visible ? <EyeOff /> : <Eye />}
                </InputGroupButton>
                <InputGroupButton
                  size="xs"
                  onClick={() => {
                    setValue(generatePassword());
                    setVisible(true);
                  }}
                >
                  <RefreshCw /> Generate
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {error ? (
              <FieldError>{error}</FieldError>
            ) : (
              <FieldDescription>Type one or generate it. You&apos;ll copy it on the next screen.</FieldDescription>
            )}
          </Field>
          <Button type="submit" disabled={setPassword.isPending || password.length === 0}>
            {setPassword.isPending ? "Setting…" : "Set password"}
          </Button>
        </form>
      )}
    </div>
  );
}
