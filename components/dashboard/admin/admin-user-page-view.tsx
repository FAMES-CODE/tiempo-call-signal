"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Loader2,
  UserRound,
  TrendingUp,
  Clock,
  CheckCircle2,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocalePrefix, withLocalePath } from "@/lib/locale-path";

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type UserStatsResponse = {
  user: { id: number; username: string; role: string };
  overview: {
    total: number;
    pending: number;
    resolved: number;
    resolvedByThisUser: number;
  };
  perMonth: Array<{ key: string; count: number }>;
  perDay: Array<{ day: string; count: number }>;
};

function parseDayKeyLocal(dayKey: string): Date {
  return new Date(`${dayKey}T12:00:00`);
}

function formatDayLabel(dayKey: string, locale?: string): string {
  try {
    return parseDayKeyLocal(dayKey).toLocaleDateString(locale || undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dayKey;
  }
}

function formatMonthYear(month: number, year: number, locale?: string) {
  try {
    return new Date(year, month, 1).toLocaleDateString(locale || undefined, {
      month: "long",
      year: "numeric",
    });
  } catch {
    return `${month + 1}/${year}`;
  }
}

// ─── Activity Heatmap Calendar ────────────────────────────────────────────────
function ActivityCalendar({
  perDay,
  locale,
  t,
}: {
  perDay: Array<{ day: string; count: number }>;
  locale: string;
  t: TranslateFn;
}) {
  const today = new Date();
  const latestDayKey = perDay[0]?.day ?? "";
  const oldestDayKey = perDay[perDay.length - 1]?.day ?? "";

  const [viewMonth, setViewMonth] = React.useState(() => {
    if (latestDayKey) {
      const d = parseDayKeyLocal(latestDayKey);
      return { month: d.getMonth(), year: d.getFullYear() };
    }
    return { month: today.getMonth(), year: today.getFullYear() };
  });

  React.useEffect(() => {
    if (latestDayKey) {
      const d = parseDayKeyLocal(latestDayKey);
      setViewMonth({ month: d.getMonth(), year: d.getFullYear() });
      return;
    }
    const now = new Date();
    setViewMonth({ month: now.getMonth(), year: now.getFullYear() });
  }, [latestDayKey]);

  // Build a lookup: "YYYY-MM-DD" → count
  const dayMap = React.useMemo(() => {
    const m = new Map<string, number>();
    perDay.forEach((r) => m.set(r.day, r.count));
    return m;
  }, [perDay]);

  const maxCount = React.useMemo(
    () => Math.max(1, ...perDay.map((r) => r.count)),
    [perDay],
  );

  const { month, year: vy } = viewMonth;
  const firstDay = new Date(vy, month, 1);
  const daysInMonth = new Date(vy, month + 1, 0).getDate();
  // 0=Sun … 6=Sat — shift so Mon=0
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () =>
    setViewMonth(({ month: m, year: y }) =>
      m === 0 ? { month: 11, year: y - 1 } : { month: m - 1, year: y },
    );
  const nextMonth = () =>
    setViewMonth(({ month: m, year: y }) =>
      m === 11 ? { month: 0, year: y + 1 } : { month: m + 1, year: y },
    );

  const pad = (n: number) => String(n).padStart(2, "0");

  function intensity(count: number): string {
    const ratio = count / maxCount;
    if (ratio === 0) return "bg-muted/40";
    if (ratio < 0.25) return "bg-emerald-200 dark:bg-emerald-900/60";
    if (ratio < 0.5) return "bg-emerald-400 dark:bg-emerald-700";
    if (ratio < 0.75) return "bg-emerald-500 dark:bg-emerald-500";
    return "bg-emerald-600 dark:bg-emerald-400";
  }

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const jumpToLatest = () => {
    if (!latestDayKey) return;
    const d = parseDayKeyLocal(latestDayKey);
    setViewMonth({ month: d.getMonth(), year: d.getFullYear() });
  };
  const jumpToOldest = () => {
    if (!oldestDayKey) return;
    const d = parseDayKeyLocal(oldestDayKey);
    setViewMonth({ month: d.getMonth(), year: d.getFullYear() });
  };

  const rangeLabel =
    oldestDayKey && latestDayKey
      ? `${parseDayKeyLocal(oldestDayKey).toLocaleDateString(locale || undefined)} → ${parseDayKeyLocal(latestDayKey).toLocaleDateString(locale || undefined)}`
      : null;

  const weekDayLabels = React.useMemo(() => {
    const base = new Date(Date.UTC(2021, 0, 4)); // Monday
    return Array.from({ length: 7 }, (_, i) =>
      new Date(base.getTime() + i * 86400000).toLocaleDateString(
        locale || undefined,
        { weekday: "long" },
      ),
    );
  }, [locale]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {t("common.dashboard.adminUser.calendar.title")}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={prevMonth}
              aria-label={t("common.dashboard.adminUser.calendar.prevMonthAria")}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[140px] text-center text-sm font-medium capitalize">
              {formatMonthYear(month, vy, locale)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={nextMonth}
              aria-label={t("common.dashboard.adminUser.calendar.nextMonthAria")}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        {rangeLabel ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("common.dashboard.adminUser.calendar.periodHint", {
              range: rangeLabel,
            })}
          </p>
        ) : null}
      </CardHeader>
      <CardContent>
        {/* Day-of-week headers */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {weekDayLabels.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null)
              return (
                <div
                  key={`empty-${idx}`}
                  className="aspect-square rounded-md"
                />
              );

            const dateStr = `${vy}-${pad(month + 1)}-${pad(day)}`;
            const count = dayMap.get(dateStr) ?? 0;
            const isToday = dateStr === todayStr;

            return (
              <div
                key={dateStr}
                title={
                  count > 0
                    ? t("common.dashboard.adminUser.calendar.dayTooltipWithCount", {
                        date: dateStr,
                        count,
                      })
                    : dateStr
                }
                className={[
                  "group relative flex aspect-square flex-col items-center justify-center rounded-md text-[11px] font-medium transition-all duration-150",
                  count > 0
                    ? intensity(count)
                    : "bg-muted/30 hover:bg-muted/60",
                  isToday
                    ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                    : "",
                  count > 0
                    ? "text-emerald-900 dark:text-emerald-50 cursor-default"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                {day}
                {count > 0 && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-semibold opacity-70 group-hover:opacity-100">
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={jumpToLatest}
              disabled={!latestDayKey}
            >
              {t("common.dashboard.adminUser.calendar.lastActiveMonth")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={jumpToOldest}
              disabled={!oldestDayKey}
            >
              {t("common.dashboard.adminUser.calendar.firstActiveMonth")}
            </Button>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-[10px] text-muted-foreground">
              {t("common.dashboard.adminUser.calendar.less")}
            </span>
            {[
              "bg-muted/40",
              "bg-emerald-200 dark:bg-emerald-900/60",
              "bg-emerald-400 dark:bg-emerald-700",
              "bg-emerald-500 dark:bg-emerald-500",
              "bg-emerald-600 dark:bg-emerald-400",
            ].map((cls, i) => (
              <div key={i} className={`size-3 rounded-sm ${cls}`} />
            ))}
            <span className="text-[10px] text-muted-foreground">
              {t("common.dashboard.adminUser.calendar.more")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Monthly bar chart ────────────────────────────────────────────────────────
function formatYearMonth(ymKey: string, locale?: string) {
  const [y, m] = ymKey.split("-").map(Number);
  if (!y || !m) return ymKey;
  return new Date(y, m - 1, 1).toLocaleDateString(locale || undefined, {
    month: "short",
    year: "numeric",
  });
}

function MonthlyChart({
  perMonth,
  locale,
  t,
}: {
  perMonth: Array<{ key: string; count: number }>;
  locale: string;
  t: TranslateFn;
}) {
  const maxCount = Math.max(1, ...perMonth.map((r) => r.count));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {t("common.dashboard.adminUser.monthly.title")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t("common.dashboard.adminUser.monthly.subtitle", {
            months: perMonth.length,
          })}
        </p>
      </CardHeader>
      <CardContent>
        {perMonth.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            {t("common.dashboard.adminUser.monthly.empty")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto pb-2">
              <div className="flex h-40 min-w-min items-end gap-1 px-1">
                {perMonth.map((row) => {
                  const heightPct = (row.count / maxCount) * 100;
                  const shortLabel = row.key.replace(/^(\d{4})-(\d{2})$/, "$2/$1");
                  return (
                    <div
                      key={row.key}
                      className="group relative flex w-8 min-w-[28px] shrink-0 flex-col items-center justify-end sm:w-9"
                    >
                      <div className="pointer-events-none absolute bottom-full z-10 mb-1.5 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-center text-[10px] text-background shadow-lg group-hover:block">
                        {formatYearMonth(row.key, locale)} :{" "}
                        <strong>{row.count}</strong>
                      </div>
                      <div
                        className="w-full min-h-[3px] rounded-t-md bg-primary/80 transition-all duration-300 hover:bg-primary"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="mt-1 max-w-full truncate text-[8px] font-medium text-muted-foreground sm:text-[9px]">
                        {shortLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 max-h-52 divide-y divide-border overflow-y-auto rounded-lg border">
              {perMonth.map((row) => (
                <div key={row.key} className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-sm text-muted-foreground capitalize">
                    {formatYearMonth(row.key, locale)}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all"
                        style={{ width: `${(row.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold tabular-nums">
                      {row.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  colorClass = "",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass?: string;
}) {
  return (
    <Card className={colorClass}>
      <CardContent className="flex items-center gap-4 pt-5 pb-5">
        <div className="rounded-xl bg-background/60 p-2.5 shadow-sm">
          <Icon className="size-5 text-foreground/70" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Recent days list (filtered + paginated — never renders thousands of lines)
const PAGE_SIZE_OPTIONS = [15, 25, 50] as const;

function RecentDaysList({
  perDay,
  locale,
  t,
}: {
  perDay: Array<{ day: string; count: number }>;
  locale: string;
  t: TranslateFn;
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState<number>(25);

  const filtered = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return perDay;
    return perDay.filter((row) => {
      if (row.day.toLowerCase().includes(q)) return true;
      return formatDayLabel(row.day, locale).toLowerCase().includes(q);
    });
  }, [perDay, searchQuery, locale]);

  React.useEffect(() => {
    setPage(0);
  }, [searchQuery, pageSize]);

  const pageCount = React.useMemo(
    () => Math.max(1, Math.ceil(filtered.length / pageSize) || 1),
    [filtered.length, pageSize],
  );

  React.useEffect(() => {
    setPage((p) => Math.min(p, pageCount - 1));
  }, [pageCount]);

  const maxInFilter = React.useMemo(
    () => (filtered.length ? Math.max(...filtered.map((r) => r.count)) : 1),
    [filtered],
  );

  const peak = React.useMemo(() => {
    if (filtered.length === 0) return null;
    return filtered.reduce((best, row) => (row.count > best.count ? row : best));
  }, [filtered]);

  const totalSheetsInFilter = React.useMemo(
    () => filtered.reduce((s, r) => s + r.count, 0),
    [filtered],
  );

  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const rangeStart = filtered.length === 0 ? 0 : safePage * pageSize + 1;
  const rangeEnd = Math.min(filtered.length, safePage * pageSize + pageRows.length);

  const goFirst = () => setPage(0);
  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(pageCount - 1, p + 1));
  const goLast = () => setPage(pageCount - 1);

  if (perDay.length === 0)
    return (
      <div className="flex h-28 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        {t("common.dashboard.adminUser.recentDays.empty")}
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("common.dashboard.adminUser.recentDays.filterPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9"
            aria-label={t("common.dashboard.adminUser.recentDays.filterAria")}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {t("common.dashboard.adminUser.recentDays.linesPerPage")}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v))}
          >
            <SelectTrigger className="h-9 w-[88px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
          <span>
            {t("common.dashboard.adminUser.recentDays.noMatch", {
              query: searchQuery.trim(),
            })}
          </span>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-xs"
            onClick={() => setSearchQuery("")}
          >
            {t("common.dashboard.adminUser.recentDays.clearFilter")}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              {t("common.dashboard.adminUser.recentDays.summary", {
                days: filtered.length,
                sheets: totalSheetsInFilter,
                filteredLabel: searchQuery.trim()
                  ? t("common.dashboard.adminUser.recentDays.filteredSuffix")
                  : "",
              })}
            </span>
            {peak ? (
              <span className="hidden sm:inline">
                {t("common.dashboard.adminUser.recentDays.peak", {
                  count: peak.count,
                  day: formatDayLabel(peak.day, locale),
                })}
              </span>
            ) : null}
          </div>

          <div className="rounded-xl border bg-card/50 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[min(52%,320px)]">
                    {t("common.dashboard.adminUser.recentDays.day")}
                  </TableHead>
                  <TableHead className="hidden min-w-[120px] sm:table-cell">
                    {t("common.dashboard.adminUser.recentDays.intensity")}
                  </TableHead>
                  <TableHead className="hidden w-20 text-right sm:table-cell">
                    {t("common.dashboard.adminUser.recentDays.sheets")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((row) => {
                  const pct = Math.max(5, (row.count / maxInFilter) * 100);
                  return (
                    <TableRow key={row.day} className="group">
                      <TableCell className="align-top py-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-3 sm:justify-start">
                            <span className="font-medium leading-tight text-foreground">
                              {formatDayLabel(row.day, locale)}
                            </span>
                            <span className="tabular-nums text-sm font-semibold sm:hidden">
                              {row.count}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted sm:hidden">
                            <div
                              className="h-full rounded-full bg-primary/65"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden align-middle sm:table-cell">
                        <div className="h-2 max-w-md overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary/65 transition-colors group-hover:bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-right align-middle tabular-nums text-sm font-semibold sm:table-cell">
                        {row.count}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-muted-foreground sm:text-left">
              {t("common.dashboard.adminUser.recentDays.range", {
                start: rangeStart,
                end: rangeEnd,
                total: filtered.length,
              })}
            </p>
            <div className="flex items-center justify-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                onClick={goFirst}
                disabled={safePage <= 0}
                aria-label={t("common.dashboard.adminUser.recentDays.firstPageAria")}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                onClick={goPrev}
                disabled={safePage <= 0}
                aria-label={t("common.dashboard.adminUser.recentDays.prevPageAria")}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-[100px] px-2 text-center text-xs tabular-nums text-foreground">
                {t("common.dashboard.adminUser.recentDays.page", {
                  page: safePage + 1,
                  total: pageCount,
                })}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                onClick={goNext}
                disabled={safePage >= pageCount - 1}
                aria-label={t("common.dashboard.adminUser.recentDays.nextPageAria")}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                onClick={goLast}
                disabled={safePage >= pageCount - 1}
                aria-label={t("common.dashboard.adminUser.recentDays.lastPageAria")}
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminUserPageView({ userId }: { userId: string }) {
  const { t, i18n } = useTranslation("common");
  const prefix = useLocalePrefix();
  const locale = i18n.language?.split("-")[0] || "en";

  const fetcher = React.useCallback(
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || t("common.dashboard.adminUser.loadFailed"));
      }
      return (await res.json()) as UserStatsResponse;
    },
    [t],
  );

  const { data, error, isLoading, mutate } = useSWR<UserStatsResponse>(
    `/api/admin/user/${userId}/stats`,
    fetcher,
    { refreshInterval: 30000 },
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* ── Header ── */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href={withLocalePath(prefix, "/dashboard/admin")}
            className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("common.dashboard.adminUser.backToAdmin")}
          </Link>
          <div className="mb-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <UserRound className="size-4" aria-hidden />
            {t("common.dashboard.adminUser.eyebrow")}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {data?.user?.username ??
              t("common.dashboard.adminUser.fallbackUser", { id: userId })}
          </h1>
          {data?.user?.role && (
            <Badge variant="secondary" className="mt-1.5 capitalize">
              {data.user.role}
            </Badge>
          )}
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("common.dashboard.adminUser.description")}
          </p>
        </div>
         
      </section>

      {/* ── Error ── */}
      {error ? (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 text-sm text-destructive">
            {(error as Error).message || t("common.dashboard.adminUser.loadError")}
          </CardContent>
        </Card>
      ) : null}

      {/* ── Loading ── */}
      {isLoading && !data ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          {t("common.dashboard.adminUser.loading")}
        </div>
      ) : null}

      {/* ── Content ── */}
      {data ? (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t("common.dashboard.adminUser.stats.createdTotal")}
              value={data.overview.total}
              icon={TrendingUp}
            />
            <StatCard
              label={t("common.dashboard.adminUser.stats.pendingAmong")}
              value={data.overview.pending}
              icon={Clock}
              colorClass="border-amber-500/30 bg-amber-500/5"
            />
            <StatCard
              label={t("common.dashboard.adminUser.stats.closedAmong")}
              value={data.overview.resolved}
              icon={CheckCircle2}
              colorClass="border-emerald-500/30 bg-emerald-500/5"
            />
            <StatCard
              label={t("common.dashboard.adminUser.stats.resolvedByUserTotal")}
              value={data.overview.resolvedByThisUser}
              icon={BadgeCheck}
            />
          </div>

          {/* Calendar + monthly chart */}
          <div className="grid gap-4 xl:grid-cols-2">
            <ActivityCalendar perDay={data.perDay} locale={locale} t={t} />
            <MonthlyChart perMonth={data.perMonth} locale={locale} t={t} />
          </div>

          {/* Recent daily activity */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {t("common.dashboard.adminUser.recentDays.title")}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("common.dashboard.adminUser.recentDays.subtitle")}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 self-start text-xs font-normal">
                  {t("common.dashboard.adminUser.recentDays.daysBadge", {
                    days: data.perDay.length,
                  })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <RecentDaysList perDay={data.perDay} locale={locale} t={t} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
