"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  ChangePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/schemas/authSchema";
import { cn } from "@/lib/utils";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    } else if (status === "authenticated" && !session?.user?.mustChangePassword) {
      router.replace("/dashboard");
    }
  }, [status, session?.user?.mustChangePassword, router]);

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = async (data) => {
    setSubmitting(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(
          typeof payload.error === "string" ? payload.error : "Failed to change password",
        );
        return;
      }
      await update({ mustChangePassword: false });
      toast.success("Password updated");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!session?.user?.mustChangePassword) {
    return null;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <form
        className={cn("flex w-full max-w-sm flex-col gap-6")}
        onSubmit={handleSubmit(onSubmit)}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Change password</h1>
            <p className="text-sm text-muted-foreground text-balance">
              Your administrator requires you to set a new password before accessing the application.
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="newPassword">New password</FieldLabel>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm</FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </Field>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Saving…" : "Save and continue"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
