"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const SUPPORTED_LOCALES = ["en", "fr", "ar"] as const;

function replaceLocaleInPath(pathname: string, locale: string) {
  const segments = pathname.split("/");
  const firstSegment = segments[1];

  if (
    SUPPORTED_LOCALES.includes(
      firstSegment as (typeof SUPPORTED_LOCALES)[number],
    )
  ) {
    segments[1] = locale;
    return segments.join("/") || "/";
  }

  return `/${locale}${pathname === "/" ? "" : pathname}`;
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { i18n, t } = useTranslation("common");
  const currentLocale = i18n.language;
  return (
    <Select value={currentLocale}>
      <SelectTrigger>
        <SelectValue placeholder={t("common.languageSwitcher.placeholder")} />
      </SelectTrigger>
      <SelectContent className="flex items-center gap-2">
        <SelectGroup>
          {SUPPORTED_LOCALES.map((locale) => (
            <SelectItem
              className={cn(currentLocale === locale ? "bg-primary text-primary-foreground" : "")}
              key={locale}
              value={locale}
              onClick={() => {
                router.push(replaceLocaleInPath(pathname, locale));
                i18n.changeLanguage(locale);
              }}
            >
              {locale.toUpperCase()}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
