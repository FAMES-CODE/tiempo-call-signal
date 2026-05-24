"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  Loader2,
  Settings2,
  Users,
} from "lucide-react";

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
import { useLocalePrefix, withLocalePath } from "@/lib/locale-path";
import { useRouter } from "next/navigation";

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

export default function AdminPageView() {
  const { t } = useTranslation("common");
  const prefix = useLocalePrefix();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const router = useRouter();
  const fetcher = React.useCallback(
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || t("common.dashboard.admin.fetchStatsFailed"));
      }
      return (await res.json()) as AdminStatsResponse;
    },
    [t],
  );

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
      const res = await fetch(`${apiBaseUrl}/api/admin/sync-customers`, {
        method: "POST",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSyncMessage(body?.error ? String(body.error) : t("common.dashboard.admin.syncFailed"));
        return;
      }
      setSyncMessage(t("common.dashboard.admin.syncSuccess"));
    } catch (e: unknown) {
      setSyncMessage(e instanceof Error ? e.message : t("common.dashboard.admin.syncFailed"));
    } finally {
      setSyncing(false);
    }
  };

  const onResetPassword = async () => {
    if (!selectedUserId) return;
    setResetLoading(true);
    setResetMessage("");
    try {
      const res = await fetch(
        `${apiBaseUrl}/api/admin/users/${selectedUserId}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newPassword: newPassword.trim() || undefined,
          }),
        },
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResetMessage(
          body?.error ? String(body.error) : t("common.dashboard.admin.passwordResetFailed"),
        );
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
      setResetMessage(
        e instanceof Error ? e.message : t("common.dashboard.admin.passwordResetFailed"),
      );
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
            {t("common.dashboard.admin.eyebrow")}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t("common.dashboard.admin.title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("common.dashboard.admin.description")}
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
          <Button type="button" onClick={onSyncCustomers} disabled={syncing}>
            {syncing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("common.dashboard.admin.syncing")}
              </>
            ) : (
              t("common.dashboard.admin.syncCustomers")
            )}
          </Button>
          <Button 
            type="button"
            onClick={() => {
              router.push(withLocalePath(prefix, "/register"));
            }}
          >
            {t("common.dashboard.admin.createUser")}
          </Button>
        </div>
      </section>

      {error ? (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 text-sm text-destructive">
            {(error as Error).message || t("common.dashboard.admin.loadError")}
          </CardContent>
        </Card>
      ) : null}

      {isLoading && !data ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
          {t("common.dashboard.admin.loadingData")}
        </div>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("common.dashboard.admin.cardTotalUsers")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">
                  {data.overview.totalUsers}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("common.dashboard.admin.cardAdmins", { count: data.overview.totalAdmins })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {t("common.dashboard.admin.cardAllSheets")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">
                  {data.overview.totalSheets}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("common.dashboard.admin.cardAcrossYears")}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-900 dark:text-amber-100">
                  {t("common.dashboard.admin.cardPending")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">
                  {data.overview.pendingSheets}
                </p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-emerald-900 dark:text-emerald-100">
                  {t("common.dashboard.admin.cardResolved")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">
                  {data.overview.resolvedSheets}
                </p>
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
                  {t("common.dashboard.admin.usersTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.dashboard.admin.colUser")}</TableHead>
                      <TableHead>{t("common.dashboard.admin.colRole")}</TableHead>
                      <TableHead className="text-right">{t("common.dashboard.admin.colAnalytics")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.username}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.role}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={withLocalePath(prefix, `/dashboard/admin/user/${u.id}`)}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {t("common.dashboard.admin.viewStats")}
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
                <CardTitle>{t("common.dashboard.admin.quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium">
                    {t("common.dashboard.admin.resetPasswordTitle")}
                  </p>
                  <div className="grid gap-2">
                    <Select
                      value={selectedUserId}
                      onValueChange={(v) => setSelectedUserId(v ?? "")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("common.dashboard.admin.selectUser")} />
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
                      placeholder={t("common.dashboard.admin.tempPasswordPlaceholder")}
                    />
                    <Button
                      type="button"
                      onClick={onResetPassword}
                      disabled={!selectedUserId || resetLoading}
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          {t("common.dashboard.admin.resetting")}
                        </>
                      ) : (
                        t("common.dashboard.admin.resetPassword")
                      )}
                    </Button>
                  </div>
                  {resetMessage ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {resetMessage}
                    </p>
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
