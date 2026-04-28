"use client";

import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

import LanguageSwitcher from "@/components/i18n/language-switcher";
import { useLocalePrefix, withLocalePath } from "@/lib/locale-path";
import { useTranslation } from "react-i18next";

import RegisterForm from "./register-form";

function RegisterComponent() {
  const { t } = useTranslation("common");
  const prefix = useLocalePrefix();

  return (
    <div className=" bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-between gap-2 self-stretch">
          <Link
            href={withLocalePath(prefix, "/")}
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="text-lg font-bold md:text-2xl capitalize">{t("common.brand")}</span>
          </Link>
          <LanguageSwitcher />
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

export default RegisterComponent;
