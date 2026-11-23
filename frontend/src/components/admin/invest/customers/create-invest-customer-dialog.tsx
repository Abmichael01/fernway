"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import type { z } from "zod";
import { ApiError } from "@/api/client";
import { applyFieldErrors, PasswordField, TextField } from "@/components/admin/shared/form-fields";
import { InvestSignInDetails } from "@/components/admin/invest/shared/invest-sign-in-details";
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
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useCreateInvestCustomer } from "@/hooks/admin-invest/useCreateInvestCustomer";
import { generatePassword } from "@/lib/password";
import { type AdminInvestCustomerCreateInput, adminInvestCustomerCreateSchema } from "@/schemas/invest";

type FormInput = z.input<typeof adminInvestCustomerCreateSchema>;

const defaults: FormInput = { firstName: "", lastName: "", email: "", phone: "", password: "" };

interface Created {
  id: string;
  firstName: string;
  email: string;
  password: string;
}

export function CreateInvestCustomerDialog({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Held only in memory, only until this dialog closes.
  const [created, setCreated] = useState<Created | null>(null);
  const createCustomer = useCreateInvestCustomer();
  const form = useForm<FormInput, unknown, AdminInvestCustomerCreateInput>({
    resolver: zodResolver(adminInvestCustomerCreateSchema),
    defaultValues: defaults,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setCreated(null);
      form.reset({ ...defaults, password: generatePassword() });
    } else if (created) {
      router.push(`/admin/invest/customers/${created.id}`);
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
              <ResponsiveModalTitle className="font-heading text-xl">Customer created</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Send these details to {created.firstName} yourself, by text or email. They sign in at /invest/sign-in.
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <InvestSignInDetails name={created.firstName} email={created.email} password={created.password} />
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
              <ResponsiveModalTitle className="font-heading text-xl">New Invest customer</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                They sign in to Lindenway Invest with this email and password. New accounts start with no cash.
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <FieldGroup className="gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField control={form.control} name="firstName" label="First name" />
                    <TextField control={form.control} name="lastName" label="Last name" />
                  </div>
                  <TextField control={form.control} name="email" label="Email" type="email" />
                  <TextField control={form.control} name="phone" label="Phone" type="tel" />
                  <PasswordField
                    control={form.control}
                    name="password"
                    label="Password"
                    description="Generated for you. You'll copy it on the next screen."
                    onGenerate={() => form.setValue("password", generatePassword(), { shouldValidate: true })}
                  />
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
