"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, CalendarDays, Loader2, RefreshCw, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type UserStatsResponse = {
  user: { id: number; username: string; role: string };
  year: number;
  availableYears: number[];
  overview: {
    total: number;
    pending: number;
    resolved: number;
    resolvedByThisUser: number;
  };
  perMonth: Array<{ month: string; count: number }>;
  perDay: Array<{ day: string; count: number }>;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || "Failed to load user stats");
  }
  return (await res.json()) as UserStatsResponse;
};

export default function AdminUserPageView({ userId }: { userId: string }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = React.useState(String(currentYear));

  const { data, error, isLoading, mutate } = useSWR<UserStatsResponse>(
    `/api/admin/user/${userId}/stats?year=${year}`,
    fetcher,
    { refreshInterval: 30000 },
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/dashboard/admin"
            className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to admin
          </Link>
          <div className="mb-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <UserRound className="size-4" aria-hidden />
            User analytics
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {data?.user?.username ?? `User #${userId}`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View activity by year, month, and day.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={year} onValueChange={(v) => setYear(v || String(currentYear))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {(data?.availableYears ?? [currentYear]).map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={() => void mutate()} disabled={isLoading}>
            <RefreshCw className={isLoading ? "size-4 animate-spin" : "size-4"} />
            Refresh
          </Button>
        </div>
      </section>

      {error ? (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 text-sm text-destructive">
            {(error as Error).message || "Unable to load user statistics."}
          </CardContent>
        </Card>
      ) : null}

      {isLoading && !data ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          Loading user data...
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Created sheets ({data.year})</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">{data.overview.total}</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-900 dark:text-amber-100">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">{data.overview.pending}</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-emerald-900 dark:text-emerald-100">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">{data.overview.resolved}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Resolved by this user ({data.year})</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">{data.overview.resolvedByThisUser}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Per month</CardTitle>
                <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.perMonth.length ? (
                      data.perMonth.map((row) => (
                        <TableRow key={row.month}>
                          <TableCell className="font-medium">{row.month}</TableCell>
                          <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-16 text-center text-muted-foreground">
                          No data for this year.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Per day (newest first)</CardTitle>
                <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.perDay.length ? (
                      data.perDay.slice(0, 60).map((row) => (
                        <TableRow key={row.day}>
                          <TableCell className="font-medium">{row.day}</TableCell>
                          <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-16 text-center text-muted-foreground">
                          No data for this year.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {data.perDay.length > 60 ? (
                  <p className="px-4 py-3 text-xs text-muted-foreground">
                    Showing latest 60 days. (Total days with activity: {data.perDay.length})
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

