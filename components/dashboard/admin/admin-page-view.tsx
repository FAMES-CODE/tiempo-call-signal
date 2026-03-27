"use client";

import * as React from "react";
import useSWR from "swr";
import { Loader2, RefreshCw, Settings2, ShieldAlert, UserRoundCog } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type AdminUser = {
  id: number;
  username: string;
  role: string;
};

type AdminStatsResponse = {
  overview: {
    totalUsers: number;
    totalAdmins: number;
    totalSheets: number;
    pendingSheets: number;
    resolvedSheets: number;
    selectedYearSheets: number;
    selectedYearResolved: number;
  };
  year: number;
  availableYears: number[];
  users: AdminUser[];
  sheetsPerMonth: Array<{ month: string; count: number }>;
  sheetsPerUser: Array<{ userId: number; count: number }>;
  sheetsPerUserByMonth: Array<{ userId: number; month: string; count: number }>;
  resolvedByUser: Array<{ userId: number; count: number }>;
  resolvedByUserByMonth: Array<{ userId: number; month: string; count: number }>;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || "Failed to load admin stats");
  }
  return (await res.json()) as AdminStatsResponse;
};

function userName(users: AdminUser[], userId: number) {
  return users.find((u) => u.id === userId)?.username ?? `#${userId}`;
}

export default function AdminPageView() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = React.useState(String(currentYear));
  const [syncing, setSyncing] = React.useState(false);
  const [syncMessage, setSyncMessage] = React.useState("");
  const [selectedUserId, setSelectedUserId] = React.useState<string>("");
  const [newPassword, setNewPassword] = React.useState("");
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetMessage, setResetMessage] = React.useState("");

  const { data, error, isLoading, mutate } = useSWR<AdminStatsResponse>(
    `/api/admin/stats?year=${year}`,
    fetcher,
    { refreshInterval: 30000 },
  );

  const onSyncCustomers = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch("/api/admin/sync-customers", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSyncMessage(body?.error ? String(body.error) : "Sync failed");
        return;
      }
      setSyncMessage("Customers synchronized successfully.");
    } catch (e: unknown) {
      setSyncMessage(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const onResetPassword = async () => {
    if (!selectedUserId) return;
    setResetLoading(true);
    setResetMessage("");

    try {
      const res = await fetch(`/api/admin/users/${selectedUserId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: newPassword.trim() || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResetMessage(body?.error ? String(body.error) : "Password reset failed");
        return;
      }
      setResetMessage(
        `Password reset for ${String(body.username)}. Temporary password: ${String(
          body.temporaryPassword,
        )}`,
      );
      setNewPassword("");
      await mutate();
    } catch (e: unknown) {
      setResetMessage(e instanceof Error ? e.message : "Password reset failed");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Settings2 className="size-4" aria-hidden />
            Administration
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin dashboard</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Monitor user activity and app usage by year/month, and execute admin-only actions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={year} onValueChange={(value) => setYear(value ?? String(currentYear))}>
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
            {(error as Error).message || "Unable to load admin statistics."}
          </CardContent>
        </Card>
      ) : null}

      {isLoading && !data ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          Loading admin data...
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">{data.overview.totalUsers}</p>
                <p className="text-xs text-muted-foreground">
                  {data.overview.totalAdmins} admin(s)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">All sheets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">{data.overview.totalSheets}</p>
                <p className="text-xs text-muted-foreground">Across all years</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-900 dark:text-amber-100">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">{data.overview.pendingSheets}</p>
                <p className="text-xs text-muted-foreground">Global pending sheets</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-emerald-900 dark:text-emerald-100">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">{data.overview.resolvedSheets}</p>
                <p className="text-xs text-muted-foreground">Global resolved sheets</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sheets per month ({data.year})</CardTitle>
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
                    {data.sheetsPerMonth.length ? (
                      data.sheetsPerMonth.map((row) => (
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
              <CardHeader>
                <CardTitle>Sheets per user ({data.year})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Created sheets</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.sheetsPerUser.length ? (
                      data.sheetsPerUser.map((row) => (
                        <TableRow key={row.userId}>
                          <TableCell>{userName(data.users, row.userId)}</TableCell>
                          <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-16 text-center text-muted-foreground">
                          No user activity for this year.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resolved by user ({data.year})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Resolved sheets</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.resolvedByUser.length ? (
                      data.resolvedByUser.map((row) => (
                        <TableRow key={row.userId}>
                          <TableCell>{userName(data.users, row.userId)}</TableCell>
                          <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-16 text-center text-muted-foreground">
                          No resolved activity for this year.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="rounded-lg border p-3">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <ShieldAlert className="size-4" />
                    Sync customers from Firebird
                  </p>
                  <Button type="button" onClick={onSyncCustomers} disabled={syncing}>
                    {syncing ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      "Run synchronization"
                    )}
                  </Button>
                  {syncMessage ? <p className="mt-2 text-xs text-muted-foreground">{syncMessage}</p> : null}
                </div>

                <div className="rounded-lg border p-3">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <UserRoundCog className="size-4" />
                    Reset user password
                  </p>
                  <div className="grid gap-2">
                    <Select
                      value={selectedUserId}
                      onValueChange={(value) => setSelectedUserId(value ?? "")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.users
                          .filter((u) => u.role !== "admin")
                          .map((u) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.username}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Temporary password (optional, auto-generated if empty)"
                    />
                    <Button
                      type="button"
                      onClick={onResetPassword}
                      disabled={!selectedUserId || resetLoading}
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        "Reset password"
                      )}
                    </Button>
                  </div>
                  {resetMessage ? <p className="mt-2 text-xs text-muted-foreground">{resetMessage}</p> : null}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resolved by user by month ({data.year})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Resolved count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.resolvedByUserByMonth.length ? (
                    data.resolvedByUserByMonth.map((row) => (
                      <TableRow key={`${row.userId}-${row.month}`}>
                        <TableCell className="font-medium">
                          {userName(data.users, row.userId)}
                          <Badge variant="outline" className="ml-2">
                            user
                          </Badge>
                        </TableCell>
                        <TableCell>{row.month}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-16 text-center text-muted-foreground">
                        No resolved monthly records.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sheets by user by month ({data.year})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Created count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sheetsPerUserByMonth.length ? (
                    data.sheetsPerUserByMonth.map((row) => (
                      <TableRow key={`${row.userId}-${row.month}`}>
                        <TableCell>{userName(data.users, row.userId)}</TableCell>
                        <TableCell>{row.month}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-16 text-center text-muted-foreground">
                        No monthly user records.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
