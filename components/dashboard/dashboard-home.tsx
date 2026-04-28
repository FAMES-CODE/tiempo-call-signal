"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Headphones,
  Sparkles,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import SummaryCard from "@/components/dashboard/index/left-section/summary-card";
import { MiniChart } from "@/components/dashboard/index/right-section/mini-chart";
import MiniCards from "@/components/dashboard/index/right-section/mini-cards-infos";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLocalePrefix, withLocalePath } from "@/lib/locale-path";

function formatGreeting(t: (key: string) => string) {
  const hour = new Date().getHours();
  if (hour < 12) return t("common.dashboard.home.greetingMorning");
  if (hour < 18) return t("common.dashboard.home.greetingAfternoon");
  return t("common.dashboard.home.greetingEvening");
}

export default function DashboardHome() {
  const { t, i18n } = useTranslation("common");
  const prefix = useLocalePrefix();
  const { data: session, status } = useSession();
  const username = session?.user?.username ?? t("common.dashboard.home.there");
  const locale = i18n.language?.split("-")[0] || "en";
  const today = new Date().toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-chart-2/10 p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              {status === "loading"
                ? t("common.dashboard.home.loadingSession")
                : `${formatGreeting(t)}, ${username}`}
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("common.dashboard.home.heroTitle")}
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground md:text-base">
              {t("common.dashboard.home.heroDescription")}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                {today}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                {new Date().toLocaleTimeString(locale, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={withLocalePath(prefix, "/dashboard/calls")}
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              {t("common.dashboard.home.viewCalls")}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={withLocalePath(prefix, "/dashboard/customers")}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <Users className="size-4" />
              {t("common.dashboard.home.customers")}
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {t("common.dashboard.home.activityTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("common.dashboard.home.activitySubtitle")}
            </p>
          </div>
        </div>
        <MiniCards />
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <SummaryCard />
        </div>

        <div className="space-y-6 lg:col-span-5">
          <Card className="overflow-hidden border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("common.dashboard.home.callMixTitle")}</CardTitle>
              <CardDescription>{t("common.dashboard.home.callMixDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <MiniChart />
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("common.dashboard.home.shortcutsTitle")}</CardTitle>
              <CardDescription>{t("common.dashboard.home.shortcutsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link
                href={withLocalePath(prefix, "/dashboard/calls")}
                className={buttonVariants({
                  variant: "outline",
                  className: "h-auto justify-between py-3",
                })}
              >
                <span className="flex items-center gap-2">
                  <Headphones className="size-4" />
                  {t("common.dashboard.home.openCallsList")}
                </span>
                <ArrowRight className="size-4 opacity-60" />
              </Link>
              <Link
                href={withLocalePath(prefix, "/dashboard/customers")}
                className={buttonVariants({
                  variant: "outline",
                  className: "h-auto justify-between py-3",
                })}
              >
                <span className="flex items-center gap-2">
                  <Users className="size-4" />
                  {t("common.dashboard.home.browseCustomers")}
                </span>
                <ArrowRight className="size-4 opacity-60" />
              </Link>
              <Separator className="my-1" />
              <p className="text-xs text-muted-foreground">
                {t("common.dashboard.home.shortcutHintBefore")}{" "}
                <span className="font-medium text-foreground">
                  {t("common.dashboard.home.shortcutHintHighlight")}
                </span>
                {t("common.dashboard.home.shortcutHintAfter")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
