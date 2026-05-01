"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDashed,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Star,
  User,
  PhoneCall,
  CalendarDays,
  Building2,
  CreditCard,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLocalePrefix, withLocalePath } from "@/lib/locale-path";

/* ─── Types ─────────────────────────────────────────────────── */

type CustomerCall = {
  id: number;
  status: string;
  problemType: string | null;
  problemDescription: string | null;
  observation: string | null;
  createdAt: string;
  resolvedAt: string | null;
  rate: number | null;
  user: { username: string };
  resolvedBy?: { username: string } | null;
};

type Customer = {
  id: number;
  CLIENT: string;
  CODE_CLIENT: string;
  CONTACT: string | null;
  SOLDE: string | number;
  TEL: string | null;
  EMAIL: string | null;
  ADRESSE: string | null;
  COMMUNE: string | null;
  WILAYA: string | null;
  NOTES: string | null;
  ACTIVITE: string | null;
  CREDIT_LIMIT: number | null;
  _count: { callSheets: number };
  callSheets: CustomerCall[];
};

/* ─── Helpers ────────────────────────────────────────────────── */

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function avgRating(calls: CustomerCall[]): number | null {
  const rated = calls.filter((c) => c.rate && c.rate > 0);
  if (rated.length === 0) return null;
  return rated.reduce((sum, c) => sum + (c.rate ?? 0), 0) / rated.length;
}

/* ─── Star components ────────────────────────────────────────── */

function StarDisplay({
  value,
  size = "sm",
}: {
  value: number | null;
  size?: "sm" | "md";
}) {
  const { t } = useTranslation("common");
  if (value === null)
    return (
      <span className="text-xs text-muted-foreground">
        {t("common.dashboard.customerDetail.rating.notRated")}
      </span>
    );

  const rounded = Math.round(value * 2) / 2;
  const starSize = size === "md" ? "size-4" : "size-3";
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rounded >= star;
          const half = !filled && rounded >= star - 0.5;
          return (
            <span key={star} className={cn("relative inline-block", starSize)}>
              <Star
                className={cn(starSize, "text-muted-foreground/25")}
                strokeWidth={1.5}
              />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? "100%" : "50%" }}
                >
                  <Star
                    className={cn(starSize, "fill-amber-400 text-amber-400")}
                    strokeWidth={1.5}
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span
        className={cn(
          "tabular-nums font-medium text-muted-foreground",
          size === "md" ? "text-sm" : "text-xs",
        )}
      >
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function ReputationBadge({ avg }: { avg: number | null }) {
  const { t } = useTranslation("common");
  if (avg === null)
    return (
      <Badge variant="outline" className="text-xs">
        {t("common.dashboard.customerDetail.rating.unrated")}
      </Badge>
    );
  if (avg >= 4.5)
    return (
      <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-0">
        {t("common.dashboard.customerDetail.rating.excellent")}
      </Badge>
    );
  if (avg >= 3.5)
    return (
      <Badge className="bg-sky-500/15 text-sky-800 dark:text-sky-200 border-0">
        {t("common.dashboard.customerDetail.rating.good")}
      </Badge>
    );
  if (avg >= 2.5)
    return (
      <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-0">
        {t("common.dashboard.customerDetail.rating.average")}
      </Badge>
    );
  return (
    <Badge className="bg-red-500/15 text-red-800 dark:text-red-200 border-0">
      {t("common.dashboard.customerDetail.rating.poor")}
    </Badge>
  );
}

/* ─── Stat pill ──────────────────────────────────────────────── */

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: "amber" | "emerald" | "red";
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1 px-4 py-3">
      <span
        className={cn(
          "text-2xl font-bold tabular-nums",
          accent === "amber" && "text-amber-600 dark:text-amber-400",
          accent === "emerald" && "text-emerald-600 dark:text-emerald-400",
          accent === "red" && "text-red-600 dark:text-red-400",
        )}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/* ─── Timeline item ──────────────────────────────────────────── */

function CallTimelineItem({
  call,
  index,
}: {
  call: CustomerCall;
  index: number;
}) {
  const { t } = useTranslation("common");
  const [expanded, setExpanded] = React.useState(false);
  const isPending = call.status === "pending";
  const hasDetails = call.problemDescription || call.observation;

  const statusLabel = isPending
    ? t("common.dashboard.calls.statusPending")
    : t("common.dashboard.calls.statusResolved");

  return (
    <div className="relative flex gap-4">
      {/* Connector line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
            isPending
              ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40"
              : "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40",
          )}
        >
          {isPending ? (
            <CircleDashed className="size-3.5" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
        </div>
        {/* Vertical line (not on last item) */}
        <div className="mt-1 w-px flex-1 bg-border" />
      </div>

      {/* Content */}
      <div className="mb-6 min-w-0 flex-1 rounded-lg border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              #{call.id}
            </span>
            <Badge
              variant={isPending ? "secondary" : "default"}
              className={cn(
                "capitalize text-xs",
                isPending
                  ? "bg-amber-500/15 text-amber-900 dark:text-amber-100"
                  : "bg-emerald-600/15 text-emerald-900 dark:text-emerald-100",
              )}
            >
              {statusLabel}
            </Badge>
            {call.problemType && (
              <span className="text-xs text-muted-foreground">
                {call.problemType}
              </span>
            )}
          </div>
          {/* Per-call rating */}
          {call.rate && call.rate > 0 ? (
            <StarDisplay value={call.rate} />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" />
            {formatDate(call.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <User className="size-3" />
            {call.user?.username}
          </span>
          {call.resolvedBy && (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              {t("common.dashboard.customerDetail.resolvedBy", {
                user: call.resolvedBy.username,
              })}
            </span>
          )}
        </div>

        {hasDetails && (
          <>
            <button
              type="button"
              className="mt-2 text-xs text-primary underline-offset-2 hover:underline"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded
                ? t("common.dashboard.customerDetail.hideDetails")
                : t("common.dashboard.customerDetail.showDetails")}
            </button>
            {expanded && (
              <div className="mt-2 grid gap-2 text-sm">
                {call.problemDescription && (
                  <div className="rounded-md bg-muted/40 px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">
                      {t("common.dashboard.calls.dialog.description")}
                    </p>
                    <p className="whitespace-pre-wrap">
                      {call.problemDescription}
                    </p>
                  </div>
                )}
                {call.observation && (
                  <div className="rounded-md bg-muted/40 px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">
                      {t("common.dashboard.calls.dialog.observation")}
                    </p>
                    <p className="whitespace-pre-wrap">{call.observation}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */

export default function CustomerDetailPage() {
  const { t, i18n } = useTranslation("common");
  const params = useParams();
  const id = params?.id as string;
  const prefix = useLocalePrefix();

  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/customers/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json() as Promise<Customer>;
      })
      .then(setCustomer)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        {t("common.dashboard.customerDetail.loading")}
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>{t("common.dashboard.customerDetail.notFound")}</p>
        <Link
          href={withLocalePath(prefix, "/dashboard/customers")}
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeft className="mr-2 size-4" />
          {t("common.dashboard.customerDetail.backToCustomers")}
        </Link>
      </div>
    );
  }

  const avg = avgRating(customer.callSheets);
  const resolved = customer.callSheets.filter(
    (c) => c.status === "resolved",
  ).length;
  const pending = customer.callSheets.filter(
    (c) => c.status === "pending",
  ).length;
  const ratedCount = customer.callSheets.filter(
    (c) => c.rate && c.rate > 0,
  ).length;

  const initials = customer.CLIENT.split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  // Sort calls newest first
  const sortedCalls = [...customer.callSheets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-6 p-4">
      {/* Back */}
      <Link
        href={withLocalePath(prefix, "/dashboard/customers")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        {t("common.dashboard.customerDetail.allCustomers")}
      </Link>

      {/* ── Profile header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <Avatar className="size-16 shrink-0 text-xl">
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{customer.CLIENT}</h1>
            <Badge variant="outline" className="font-mono text-xs">
              {customer.CODE_CLIENT}
            </Badge>
            <ReputationBadge avg={avg} />
          </div>

          {customer.ACTIVITE && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {customer.ACTIVITE}
            </p>
          )}

          {/* Reputation stars */}
          <div className="mt-2 flex items-center gap-2">
            <StarDisplay value={avg} size="md" />
            {ratedCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {t("common.dashboard.customerDetail.basedOnRatedCalls", {
                  count: ratedCount,
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
            <StatPill
              label={t("common.dashboard.customerDetail.stats.totalCalls")}
              value={customer._count.callSheets}
            />
            <StatPill
              label={t("common.dashboard.customerDetail.stats.resolved")}
              value={resolved}
              accent="emerald"
            />
            <StatPill
              label={t("common.dashboard.customerDetail.stats.pending")}
              value={pending}
              accent="amber"
            />
            <StatPill
              label={t("common.dashboard.customerDetail.stats.avgRating")}
              value={avg !== null ? `${avg.toFixed(1)} / 5` : t("common.dashboard.customerDetail.dash")}
              accent={
                avg !== null
                  ? avg >= 3.5
                    ? "emerald"
                    : avg >= 2.5
                      ? "amber"
                      : "red"
                  : undefined
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Detail grid ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Contact info */}
        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm font-semibold">
              {t("common.dashboard.customerDetail.sections.contactInformation")}
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <InfoRow
              icon={<User className="size-3.5" />}
              label={t("common.dashboard.customerDetail.fields.contact")}
              value={customer.CONTACT}
            />
            <InfoRow
              icon={<Phone className="size-3.5" />}
              label={t("common.dashboard.customerDetail.fields.phone")}
              value={customer.TEL}
            />
            <InfoRow
              icon={<Mail className="size-3.5" />}
              label={t("common.dashboard.customerDetail.fields.email")}
              value={customer.EMAIL}
            />
            <InfoRow
              icon={<MapPin className="size-3.5" />}
              label={t("common.dashboard.customerDetail.fields.location")}
              value={
                [customer.COMMUNE, customer.WILAYA]
                  .filter(Boolean)
                  .join(", ") || null
              }
            />
            <InfoRow
              icon={<Building2 className="size-3.5" />}
              label={t("common.dashboard.customerDetail.fields.address")}
              value={customer.ADRESSE}
            />
          </CardContent>
        </Card>

        {/* Financial info */}
        <Card>
          <CardHeader className="pb-3">
            <p className="text-sm font-semibold">
              {t("common.dashboard.customerDetail.sections.accountDetails")}
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <InfoRow
              icon={<CreditCard className="size-3.5" />}
              label={t("common.dashboard.customerDetail.fields.balance")}
              value={
                customer.SOLDE !== undefined && customer.SOLDE !== null
                  ? Number(customer.SOLDE).toLocaleString(i18n.language || undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) + ` ${t("common.dashboard.customerDetail.currency")}`
                  : null
              }
            />
            <InfoRow
              icon={<CreditCard className="size-3.5" />}
              label={t("common.dashboard.customerDetail.fields.creditLimit")}
              value={
                customer.CREDIT_LIMIT != null
                  ? Number(customer.CREDIT_LIMIT).toLocaleString(i18n.language || undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) + ` ${t("common.dashboard.customerDetail.currency")}`
                  : null
              }
            />
            {customer.NOTES && (
              <div className="rounded-md bg-muted/40 px-3 py-2 text-sm">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  {t("common.dashboard.customerDetail.fields.notes")}
                </p>
                <p className="whitespace-pre-wrap">{customer.NOTES}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Call history timeline ── */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-4">
          <PhoneCall className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold">
            {t("common.dashboard.customerDetail.sections.callHistory")}
            <span className="ml-2 font-normal text-muted-foreground">
              ({customer._count.callSheets})
            </span>
          </p>
        </CardHeader>
        <CardContent>
          {sortedCalls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("common.dashboard.customerDetail.noCalls")}
            </p>
          ) : (
            <div className="pt-1">
              {sortedCalls.map((call, i) => (
                <CallTimelineItem key={call.id} call={call} index={i} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Tiny helper ────────────────────────────────────────────── */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  const { t } = useTranslation("common");
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="font-medium truncate">
          {value || t("common.dashboard.customerDetail.dash")}
        </p>
      </div>
    </div>
  );
}
