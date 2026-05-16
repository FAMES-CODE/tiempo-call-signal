"use client";

import { GalleryVerticalEnd } from 'lucide-react';
import LoginForm from './login-form';
import LanguageSwitcher from "@/components/i18n/language-switcher";
import { useTranslation } from "react-i18next";
import { InteractiveGridPattern } from '../ui/interactive-grid-pattern';
import { cn } from '@/lib/utils';

function LoginComponent() {
  const { t } = useTranslation("common");

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between gap-2">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="text-lg font-bold md:text-2xl capitalize">
              {t("common.brand")}
            </span>
          </a>
          <LanguageSwitcher />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden min-h-svh overflow-hidden lg:block">
        <div
          aria-hidden
          className="absolute -inset-x-[12%] -inset-y-[18%] skew-y-12 rtl:-skew-y-12"
        >
          <InteractiveGridPattern
            squares={[48, 48]}
            width={32}
            height={32}
            className={cn(
              "size-full",
              "[mask-image:radial-gradient(ellipse_90%_80%_at_50%_42%,black_25%,transparent_75%)]",
            )}
            squaresClassName="stroke-primary/20"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-muted/40 to-background/90 rtl:bg-gradient-to-bl"
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0",
            "bg-[radial-gradient(ellipse_at_70%_20%,var(--primary)/0.18,transparent_55%)]",
            "rtl:bg-[radial-gradient(ellipse_at_30%_20%,var(--primary)/0.18,transparent_55%)]",
          )}
        />
        
      </div>
    </div>
  );
}

export default LoginComponent