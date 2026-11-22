"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ApiError } from "@/api/client";
import { InvestSignInDetails } from "@/components/admin/invest/shared/invest-sign-in-details";
import { applyFieldErrors, PasswordField, TextField } from "@/components/admin/shared/form-fields";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateInvestCustomer } from "@/hooks/admin-invest/useUpdateInvestCustomer";
import { generatePassword } from "@/lib/password";
import type { AdminInvestCustomer } from "@/types/invest";

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Enter the first name.").max(80),
  lastName: z.string().trim().min(1, "Enter the last name.").max(80),
  phone: z.string().trim().max(32),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({ password: z.string().min(10, "Use at least 10 characters.").max(128) });
type PasswordValues = z.infer<typeof passwordSchema>;

function ProfileForm({ customer }: { customer: AdminInvestCustomer }) {
  const update = useUpdateInvestCustomer(customer.id);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync(values);
      toast.success("Profile saved");
    } catch (error) {
      if (error instanceof ApiError) applyFieldErrors(form.setError, error.fieldErrors, error.message);
      else form.setError("root", { message: "We couldn't reach the server. Try again." });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <h3 className="font-heading text-base font-semibold">Details</h3>
      <FieldGroup className="gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={form.control} name="firstName" label="First name" />
          <TextField control={form.control} name="lastName" label="Last name" />
        </div>
        <TextField control={form.control} name="phone" label="Phone" type="tel" />
      </FieldGroup>
      <p className="text-xs text-muted-foreground">Email: {customer.email}. The email can&apos;t be changed.</p>
      {form.formState.errors.root && (
        <p role="alert" className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      )}
      <Button type="submit" className="self-start" disabled={update.isPending || !form.formState.isDirty}>
        {update.isPending && <Spinner data-icon="inline-start" />}
        Save changes
      </Button>
    </form>
  );
}

function ResetPassword({ customer }: { customer: AdminInvestCustomer }) {
  const update = useUpdateInvestCustomer(customer.id);
  const [issued, setIssued] = useState<string | null>(null);
  const form = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: { password: "" } });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync({ password: values.password });
      setIssued(values.password);
      form.reset({ password: "" });
      toast.success("Password changed");
    } catch (error) {
      if (error instanceof ApiError) applyFieldErrors(form.setError, error.fieldErrors, error.message);
      else form.setError("root", { message: "We couldn't reach the server. Try again." });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <h3 className="font-heading text-base font-semibold">Reset password</h3>
      <PasswordField
        control={form.control}
        name="password"
        label="New password"
        description="Type one, or generate one. It is shown once after you save."
        onGenerate={() => form.setValue("password", generatePassword(), { shouldValidate: true })}
      />
      {form.formState.errors.root && (
        <p role="alert" className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      )}
      <Button type="submit" variant="outline" className="self-start" disabled={update.isPending}>
        {update.isPending ? <Spinner data-icon="inline-start" /> : <KeyRound data-icon="inline-start" />}
        Set new password
      </Button>
      {issued && <InvestSignInDetails name={customer.firstName} email={customer.email} password={issued} />}
    </form>
  );
}

function AccessControl({ customer }: { customer: AdminInvestCustomer }) {
  const update = useUpdateInvestCustomer(customer.id);
  const disabling = !customer.disabled;

  const run = async () => {
    try {
      await update.mutateAsync({ disabled: disabling });
      toast.success(disabling ? "Customer disabled" : "Customer enabled");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "We couldn't reach the server. Try again.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading text-base font-semibold">Access</h3>
      <p className="text-sm text-muted-foreground">
        {disabling
          ? "A disabled customer can't sign in. Their cash and holdings stay as they are."
          : "This customer is disabled and can't sign in. Enable them to restore access."}
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={disabling ? "destructive" : "default"} className="self-start" disabled={update.isPending}>
            {disabling ? "Disable customer" : "Enable customer"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {disabling ? "Disable" : "Enable"} {customer.firstName} {customer.lastName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {disabling ? "They will be signed out and won't be able to sign in until you enable them again." : "They will be able to sign in again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void run()}>{disabling ? "Disable" : "Enable"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function CustomerProfilePanel({ customer }: { customer: AdminInvestCustomer }) {
  return (
    <div className="grid max-w-2xl gap-10">
      <ProfileForm customer={customer} />
      <ResetPassword customer={customer} />
      <AccessControl customer={customer} />
    </div>
  );
}
