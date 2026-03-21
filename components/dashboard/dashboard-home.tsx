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

function formatGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHome() {
  const { data: session, status } = useSession();
  const username = session?.user?.username ?? "there";
  const today = new Date().toLocaleDateString(undefined, {
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
                ? "Loading session…"
                : `${formatGreeting()}, ${username}`}
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Your support dashboard
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground md:text-base">
              Track calls you handle, follow up on pending cases, and keep
              customers moving— all in one place.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                {today}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                {new Date().toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/calls"
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              View calls
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/dashboard/customers"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <Users className="size-4" />
              Customers
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Your activity
            </h2>
            <p className="text-sm text-muted-foreground">
              Numbers for calls you created and cases you resolved.
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
              <CardTitle className="text-base">Call mix</CardTitle>
              <CardDescription>
                Resolved vs pending among your tracked calls.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <MiniChart />
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Shortcuts</CardTitle>
              <CardDescription>Jump to common tasks.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link
                href="/dashboard/calls"
                className={buttonVariants({
                  variant: "outline",
                  className: "h-auto justify-between py-3",
                })}
              >
                <span className="flex items-center gap-2">
                  <Headphones className="size-4" />
                  Open calls list
                </span>
                <ArrowRight className="size-4 opacity-60" />
              </Link>
              <Link
                href="/dashboard/customers"
                className={buttonVariants({
                  variant: "outline",
                  className: "h-auto justify-between py-3",
                })}
              >
                <span className="flex items-center gap-2">
                  <Users className="size-4" />
                  Browse customers
                </span>
                <ArrowRight className="size-4 opacity-60" />
              </Link>
              <Separator className="my-1" />
              <p className="text-xs text-muted-foreground">
                Log a new case from the activity panel on the left using{" "}
                <span className="font-medium text-foreground">
                  New call sheet
                </span>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
