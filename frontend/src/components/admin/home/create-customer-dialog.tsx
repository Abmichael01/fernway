"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import { ApiError } from "@/api/client";
import { applyFieldErrors, PasswordField, SwitchField, TextField } from "@/components/admin/shared/form-fields";
import { SignInDetails } from "@/components/admin/shared/sign-in-details";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/shared/responsive-modal";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useCreateCustomer } from "@/hooks/admin/useAdminCustomers";
import { generatePassword } from "@/lib/password";
import { type CustomerCreateValues, customerCreateSchema } from "@/schemas/admin";

const defaults: CustomerCreateValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  addressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  openChecking: true,
  openSavings: true,
  issueDebitCard: true,
};

interface Created {
  id: string;
  firstName: string;
  email: string;
  password: string;
}

export function CreateCustomerDialog({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Held only in memory, only until this dialog closes.
  const [created, setCreated] = useState<Created | null>(null);
  const createCustomer = useCreateCustomer();
  const form = useForm<CustomerCreateValues>({
    resolver: zodResolver(customerCreateSchema),
    defaultValues: defaults,
    // Errors appear on submit, then update as you type. Validating on blur made the form
    // jump while it was being filled in, so clicks landed on empty space.
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setCreated(null);
      form.reset({ ...defaults, password: generatePassword() });
    } else if (created) {
      router.push(`/admin/customers/${created.id}`);
      setCreated(null);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const customer = await createCustomer.mutateAsync(values);
      setCreated({ id: customer.id, firstName: customer.firstName, email: customer.email, password: values.password });
      form.reset(defaults);
    } catch (error) {
      if (error instanceof ApiError) applyFieldErrors(form.setError, error.fieldErrors, error.message);
      else form.setError("root", { message: "We couldn't reach the server. Try again." });
    }
  });

  return (
    <ResponsiveModal open={open} onOpenChange={handleOpenChange} desktop="sheet" dismissible={!createCustomer.isPending}>
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>
      <ResponsiveModalContent className="sm:max-w-lg">
        {created ? (
          <>
            <ResponsiveModalHeader className="border-b px-6 pt-6 pb-5">
              <span className="mb-2 grid size-11 place-items-center rounded-full bg-credit text-white dark:text-background">
                <CircleCheck className="size-5" aria-hidden="true" />
              </span>
              <ResponsiveModalTitle className="font-heading text-xl">Account created</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Send these details to {created.firstName} yourself, by text or email. They can sign in straight away.
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <SignInDetails name={created.firstName} email={created.email} password={created.password} />
            </div>
            <ResponsiveModalFooter className="border-t px-6 py-4">
              <Button size="lg" onClick={() => handleOpenChange(false)}>
                Done, open {created.firstName}&apos;s page
              </Button>
            </ResponsiveModalFooter>
          </>
        ) : (
          <>
            <ResponsiveModalHeader className="border-b px-6 pt-6 pb-5">
              <ResponsiveModalTitle className="font-heading text-xl">New customer</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                They sign in to the app with this email and password. New accounts start at $0.
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <FieldGroup className="gap-6">
                  <FieldSet>
                    <FieldLegend>Sign-in details</FieldLegend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField control={form.control} name="firstName" label="First name" />
                      <TextField control={form.control} name="lastName" label="Last name" />
                    </div>
                    <TextField control={form.control} name="email" label="Email" type="email" />
                    <PasswordField
                      control={form.control}
                      name="password"
                      label="Password"
                      description="Generated for you. You'll copy it on the next screen."
                      onGenerate={() => form.setValue("password", generatePassword(), { shouldValidate: true })}
                    />
                  </FieldSet>
                  <FieldSet>
                    <FieldLegend>Contact and address</FieldLegend>
                    <TextField control={form.control} name="phone" label="Phone" type="tel" placeholder="(415) 555-0142" />
                    <TextField control={form.control} name="addressLine1" label="Street address" />
                    <div className="grid grid-cols-[1fr_5rem_7rem] gap-3">
                      <TextField control={form.control} name="city" label="City" />
                      <TextField control={form.control} name="state" label="State" placeholder="CA" />
                      <TextField control={form.control} name="postalCode" label="ZIP" />
                    </div>
                  </FieldSet>
                  <FieldSet>
                    <FieldLegend>Open with</FieldLegend>
                    <SwitchField control={form.control} name="openChecking" label="Everyday checking" description="Spending account with a debit card." />
                    <SwitchField control={form.control} name="openSavings" label="High-yield savings" description="4.10% APY by default." />
                    <SwitchField control={form.control} name="issueDebitCard" label="Debit card" description="Needs a checking account." />
                  </FieldSet>
                </FieldGroup>
                {form.formState.errors.root && (
                  <p role="alert" className="mt-4 text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}
              </div>
              <ResponsiveModalFooter className="border-t px-6 py-4">
                <Button type="submit" size="lg" disabled={createCustomer.isPending}>
                  {createCustomer.isPending && <Spinner data-icon="inline-start" />}
                  {createCustomer.isPending ? "Creating…" : "Create customer"}
                </Button>
              </ResponsiveModalFooter>
            </form>
          </>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
