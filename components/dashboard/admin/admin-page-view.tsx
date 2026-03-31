"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { CalendarDays, Loader2, RefreshCw, Settings2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AdminUser = { id: number; username: string; role: string };

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
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || "Failed to load admin stats");
  }
  return (await res.json()) as AdminStatsResponse;
};

export default function AdminPageView() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const [syncing, setSyncing] = React.useState(false);
  const [syncMessage, setSyncMessage] = React.useState("");

  const [selectedUserId, setSelectedUserId] = React.useState<string>("");
  const [newPassword, setNewPassword] = React.useState("");
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetMessage, setResetMessage] = React.useState("");

  const { data, error, isLoading, mutate } = useSWR<AdminStatsResponse>(
    "/api/admin/stats",
    fetcher,
    { refreshInterval: 30000 },
  );

  const onSyncCustomers = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/sync-customers`, { method: "POST" });
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
      const res = await fetch(`${apiBaseUrl}/api/admin/users/${selectedUserId}/reset-password`, {
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
            Simple overview and quick actions. Open a user page for detailed year/day analytics.
          </p>
          <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden />
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => void mutate()} disabled={isLoading}>
            <RefreshCw className={isLoading ? "size-4 animate-spin" : "size-4"} />
            Refresh
          </Button>
          <Button type="button" onClick={onSyncCustomers} disabled={syncing}>
            {syncing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Syncing...
              </>
            ) : (
              "Sync customers"
            )}
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
                <p className="text-xs text-muted-foreground">{data.overview.totalAdmins} admin(s)</p>
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
              </CardContent>
            </Card>
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-emerald-900 dark:text-emerald-100">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">{data.overview.resolvedSheets}</p>
              </CardContent>
            </Card>
          </div>

          {syncMessage ? (
            <Card>
              <CardContent className="pt-6 text-sm">{syncMessage}</CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" aria-hidden />
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Analytics</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.username}</TableCell>
                        <TableCell className="text-muted-foreground">{u.role}</TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/dashboard/admin/user/${u.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            View stats
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium">Reset user password</p>
                  <div className="grid gap-2">
                    <Select value={selectedUserId} onValueChange={(v) => setSelectedUserId(v ?? "")}>
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
                      placeholder="Temporary password (optional)"
                    />
                    <Button type="button" onClick={onResetPassword} disabled={!selectedUserId || resetLoading}>
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
                  {resetMessage ? (
                    <p className="mt-2 text-xs text-muted-foreground">{resetMessage}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

