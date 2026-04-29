"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createChangePasswordFormSchema,
  type ChangePasswordFormValuesI18n,
} from "@/lib/schemas/authSchema";
import { getLocalePrefixFromPathname, withLocalePath } from "@/lib/locale-path";
import { cn } from "@/lib/utils";

export default function ChangePasswordPage() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const localePrefix = getLocalePrefixFromPathname(pathname);
  const { t } = useTranslation("common");
  const { data: session, status, update } = useSession();
  const [submitting, setSubmitting] = React.useState(false);

  const changePasswordSchema = React.useMemo(() => createChangePasswordFormSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValuesI18n>({
    resolver: zodResolver(changePasswordSchema),
  });

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(withLocalePath(localePrefix, "/"));
    } else if (status === "authenticated" && !session?.user?.mustChangePassword) {
      router.replace(withLocalePath(localePrefix, "/dashboard"));
    }
  }, [status, session?.user?.mustChangePassword, router, localePrefix]);

  const onSubmit: SubmitHandler<ChangePasswordFormValuesI18n> = async (data) => {
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
          typeof payload.error === "string" ? payload.error : t("common.changePassword.toastFailed"),
        );
        return;
      }
      await update({ mustChangePassword: false });
      toast.success(t("common.changePassword.toastSuccess"));
      router.push(withLocalePath(localePrefix, "/dashboard"));
      router.refresh();
    } catch {
      toast.error(t("common.changePassword.toastNetwork"));
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        {t("common.changePassword.loading")}
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
            <h1 className="text-2xl font-bold">{t("common.changePassword.title")}</h1>
            <p className="text-sm text-muted-foreground text-balance">
              {t("common.changePassword.subtitle")}
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="currentPassword">{t("common.changePassword.currentPassword")}</FieldLabel>
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
            <FieldLabel htmlFor="newPassword">{t("common.changePassword.newPassword")}</FieldLabel>
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
            <FieldLabel htmlFor="confirmPassword">{t("common.changePassword.confirm")}</FieldLabel>
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
            {submitting ? t("common.changePassword.saving") : t("common.changePassword.save")}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
