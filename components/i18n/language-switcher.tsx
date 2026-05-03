"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const SUPPORTED_LOCALES = ["en", "fr", "ar"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_META: Record<
  Locale,
  { label: string; native: string; flag: string; dir: "ltr" | "rtl" }
> = {
  en: { label: "English", native: "English", flag: "🇬🇧", dir: "ltr" },
  fr: { label: "French", native: "Français", flag: "🇫🇷", dir: "ltr" },
  ar: { label: "Arabic", native: "العربية", flag: "🇸🇦", dir: "rtl" },
};

function replaceLocaleInPath(pathname: string, locale: string) {
  const segments = pathname.split("/");
  const firstSegment = segments[1];
  if (SUPPORTED_LOCALES.includes(firstSegment as Locale)) {
    segments[1] = locale;
    return segments.join("/") || "/";
  }
  return `/${locale}${pathname === "/" ? "" : pathname}`;
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { i18n, t } = useTranslation("common");
  const currentLocale = i18n.language as Locale;
  const [open, setOpen] = useState(false);

  const current = LOCALE_META[currentLocale] ?? LOCALE_META.en;

  const handleSelect = (locale: Locale) => {
    router.push(replaceLocaleInPath(pathname, locale));
    i18n.changeLanguage(locale);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={t("common.languageSwitcher.ariaLabel")}
          className={cn(
            "group h-9 gap-2 rounded-full border border-border/60 bg-background/80 px-3",
            "text-sm font-medium shadow-sm backdrop-blur-sm",
            "transition-all duration-200",
            "hover:border-border hover:bg-accent hover:shadow-md",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            open && "border-border bg-accent shadow-md",
          )}
        >
          <Globe
            className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
            aria-hidden
          />

          <span className="flex items-center gap-1.5">
            <span
              className="text-base leading-none"
              role="img"
              aria-label={current.label}
            >
              {current.flag}
            </span>
            <span className="hidden sm:inline">{current.native}</span>
            <span className="inline sm:hidden uppercase text-xs tracking-wide">
              {currentLocale}
            </span>
          </span>

          <ChevronDown
            className={cn(
              "h-3 w-3 shrink-0 text-muted-foreground/70 transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className={cn(
          "w-44 rounded-xl border border-border/60 bg-popover/95 p-1.5",
          "shadow-lg shadow-black/[0.08] backdrop-blur-md",
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2",
        )}
      >
        <p className="px-2 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {t("common.languageSwitcher.heading")}
        </p>

        <div className="flex flex-col gap-0.5">
          {SUPPORTED_LOCALES.map((locale) => {
            const meta = LOCALE_META[locale];
            const isActive = locale === currentLocale;

            return (
              <button
                key={locale}
                onClick={() => handleSelect(locale)}
                dir={meta.dir}
                className={cn(
                  "group/item flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2",
                  "text-sm transition-all duration-150 outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                )}
                aria-pressed={isActive}
              >
                <span
                  className="text-base leading-none"
                  role="img"
                  aria-label={meta.label}
                >
                  {meta.flag}
                </span>

                <span
                  className={cn(
                    "flex-1 text-left",
                    meta.dir === "rtl" && "text-right",
                  )}
                >
                  <span
                    className={cn(
                      "block font-medium leading-none",
                      isActive && "text-primary",
                    )}
                  >
                    {meta.native}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-none text-muted-foreground/70">
                    {meta.label}
                  </span>
                </span>

                <Check
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-all duration-150",
                    isActive
                      ? "scale-100 opacity-100 text-primary"
                      : "scale-75 opacity-0",
                  )}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
