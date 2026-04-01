"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  Phone,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export type CallSheetRow = {
  id: number;
  status: string;
  problemType: string | null;
  problemDescription: string | null;
  callSim: string | null;
  callNumber: string | null;
  observation: string | null;
  isSynced?: boolean;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  customer: { CLIENT: string };
  user: { username: string; id: number };
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function statusBadge(status: string) {
  const pending = status === "pending";
  return (
    <Badge
      variant={pending ? "secondary" : "default"}
      className={cn(
        "font-medium capitalize",
        pending &&
          "bg-amber-500/15 text-amber-950 hover:bg-amber-500/20 dark:text-amber-100",
        !pending &&
          "bg-emerald-600/15 text-emerald-900 hover:bg-emerald-600/20 dark:text-emerald-100",
      )}
    >
      {pending ? (
        <CircleDashed className="mr-1 size-3" aria-hidden />
      ) : (
        <CheckCircle2 className="mr-1 size-3" aria-hidden />
      )}
      {status}
    </Badge>
  );
}

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

function truncate(text: string | null | undefined, max: number) {
  if (!text) return "—";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function CallDetailsDialog({
  row,
  currentUserId,
  onResolved,
}: {
  row: CallSheetRow;
  currentUserId: number | null;
  onResolved: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [resolving, setResolving] = React.useState(false);
  const [creatingBon, setCreatingBon] = React.useState(false);
  const [bonResult, setBonResult] = React.useState<string>("");
  const [article, setArticle] = React.useState("");
  const [qte, setQte] = React.useState<number>(1);
  const [pvHtAr, setPvHtAr] = React.useState<number>(0);
  const canResolve = row.status === "pending";
  const canSyncBon = row.status === "resolved" && !row.isSynced;

  const handleResolve = async () => {
    if (!currentUserId) return;
    setResolving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sheets/${row.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "resolved",
            resolvedAt: new Date().toISOString(),
            resolvedById: currentUserId,
          }),
        },
      );
      if (res.ok) {
        setOpen(false);
        onResolved();
      }
    } finally {
      setResolving(false);
    }
  };

  const handleCreateBon = async () => {
    setCreatingBon(true);
    setBonResult("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/firebird/bon1/from-call-sheet`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callSheetId: row.id,
            observation: row.observation ?? undefined,
            lines: article.trim()
              ? [
                  {
                    produit: article.trim(),
                    qte: Number.isFinite(qte) ? qte : 1,
                    PV_HT_AR: Number.isFinite(pvHtAr) ? pvHtAr : 0,
                  },
                ]
              : [],
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBonResult(
          data?.details
            ? `${String(data.error ?? "Error")}: ${String(data.details)}`
            : data?.error
              ? String(data.error)
              : "Error Firebird",
        );
        return;
      }
      setBonResult(
        `${data.alreadyExisted ? "Already existed" : "Created"}: NUM_BON=${data.num_bon} (recordid=${data.recordid})` +
          (data.linesInserted ? ` · lignes=${data.linesInserted}` : ""),
      );
      onResolved();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Network error";
      setBonResult(String(msg));
    } finally {
      setCreatingBon(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Details
      </Button>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Call #{row.id}</DialogTitle>
          <DialogDescription>
            {row.customer.CLIENT} · Logged {formatDate(row.createdAt)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Status</span>
            {statusBadge(row.status)}
          </div>
          <dl className="grid gap-3 rounded-lg border bg-muted/30 p-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Customer
              </dt>
              <dd className="mt-0.5 font-medium">{row.customer.CLIENT}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Number
                </dt>
                <dd className="mt-0.5">{row.callNumber || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  SIM / line
                </dt>
                <dd className="mt-0.5">{row.callSim || "—"}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Problem type
              </dt>
              <dd className="mt-0.5">{row.problemType || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap">
                {row.problemDescription || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Observation
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap">
                {row.observation || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Created by
              </dt>
              <dd className="mt-0.5">{row.user.username}</dd>
            </div>
          </dl>
          <div className="grid gap-2">
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bon Firebird
              </p>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3">
                    <Input
                      value={article}
                      onChange={(e) => setArticle(e.target.value)}
                      placeholder="Article (ex: Intervention / Pièce / Service...)"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>Quantité</Label>
                    <Input
                      value={String(qte)}
                      onChange={(e) => setQte(Number(e.target.value))}
                      placeholder="Qte"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>Prix</Label>
                    <Input
                      value={String(pvHtAr)}
                      onChange={(e) => setPvHtAr(Number(e.target.value))}
                      placeholder="PV HT"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Total HT:{" "}
                  <span className="font-mono">
                    {Number.isFinite(qte) && Number.isFinite(pvHtAr)
                      ? (qte * pvHtAr).toFixed(2)
                      : "—"}
                  </span>
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleCreateBon}
              disabled={creatingBon || !canSyncBon}
              className="w-full"
            >
              {creatingBon ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : row.isSynced ? (
                "Already synchronized"
              ) : row.status !== "resolved" ? (
                "Resolve before sync"
              ) : (
                "Create a Firebird note"
              )}
            </Button>
            {bonResult ? (
              <p className="text-xs font-mono text-muted-foreground">
                {bonResult}
              </p>
            ) : null}
          </div>
          <Link
            href="/dashboard/customers"
            className={buttonVariants({
              variant: "link",
              className: "h-auto min-h-0 p-0 text-sm font-normal",
            })}
          >
            View customers directory
          </Link>
        </div>
        {canResolve && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              onClick={handleResolve}
              disabled={resolving}
              className="w-full gap-2 sm:w-auto"
            >
              {resolving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Resolving…
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Mark as resolved
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function CallsPageView() {
  const { data: session, status: sessionStatus } = useSession();
  const currentUserId = session?.user?.id
    ? parseInt(session.user.id, 10)
    : null;

  const { data, error, isLoading, mutate } = useSWR<CallSheetRow[]>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sheets`,
    fetcher,
    { refreshInterval: 30000 },
  );

  const rows = data ?? [];

  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "pending" | "resolved"
  >("all");

  const filteredRows = React.useMemo(() => {
    let list = rows;
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const hay = [
          String(r.id),
          r.customer?.CLIENT ?? "",
          r.callNumber ?? "",
          r.callSim ?? "",
          r.problemType ?? "",
          r.observation ?? "",
          r.problemDescription ?? "",
          r.user?.username ?? "",
          r.status ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return list;
  }, [rows, query, statusFilter]);

  const stats = React.useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => r.status === "pending").length;
    const resolved = rows.filter((r) => r.status === "resolved").length;
    return { total, pending, resolved };
  }, [rows]);

  const columns = React.useMemo<ColumnDef<CallSheetRow>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            #{getValue() as number}
          </span>
        ),
        size: 72,
      },
      {
        id: "customer",
        accessorFn: (r) => r.customer?.CLIENT ?? "",
        header: "Customer",
        cell: ({ row }) => (
          <span className="max-w-[160px] truncate font-medium">
            {row.original.customer?.CLIENT ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "callNumber",
        header: "Number",
        cell: ({ getValue }) => (
          <span className="tabular-nums">
            {(getValue() as string | null) || "—"}
          </span>
        ),
      },
      {
        accessorKey: "callSim",
        header: "Line",
        cell: ({ getValue }) => (
          <Badge variant="outline" className="font-normal">
            {(getValue() as string | null) || "—"}
          </Badge>
        ),
      },
      {
        accessorKey: "problemType",
        header: "Problem",
        cell: ({ getValue }) => (
          <span
            className="max-w-[140px] truncate"
            title={(getValue() as string) ?? ""}
          >
            {truncate(getValue() as string | null, 40)}
          </span>
        ),
      },
      {
        accessorKey: "observation",
        header: "Observation",
        cell: ({ getValue }) => (
          <span
            className="max-w-[180px] truncate text-muted-foreground"
            title={(getValue() as string) ?? ""}
          >
            {truncate(getValue() as string | null, 48)}
          </span>
        ),
      },
      {
        id: "createdBy",
        accessorFn: (r) => r.user?.username ?? "",
        header: "Created by",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.user?.username ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => statusBadge(getValue() as string),
      },
      {
        id: "sync",
        accessorFn: (r) => (r.isSynced ? "synced" : "not_synced"),
        header: "Sync",
        cell: ({ row }) =>
          row.original.isSynced ? (
            <Badge className="font-normal" variant="default">
              Synced
            </Badge>
          ) : (
            <Badge className="font-normal" variant="secondary">
              Not synced
            </Badge>
          ),
        size: 110,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <CallDetailsDialog
            row={row.original}
            currentUserId={currentUserId}
            onResolved={() => void mutate()}
          />
        ),
      },
    ],
    [currentUserId, mutate],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 12 } },
  });

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4" aria-hidden />
            Call sheets
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Calls</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Review support calls, filter by status, and open a row for full
            details. You can mark your own pending calls as resolved.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void mutate()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Back to overview
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total calls
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100/90">
              Pending
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-amber-950 dark:text-amber-50">
              {stats.pending}
            </p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100/90">
              Resolved
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums text-emerald-950 dark:text-emerald-50">
              {stats.resolved}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b bg-muted/20 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <SlidersHorizontal
              className="size-4 text-muted-foreground"
              aria-hidden
            />
            Filters
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customer, number, problem…"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search calls"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending only</SelectItem>
                <SelectItem value="resolved">Resolved only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <p className="p-6 text-center text-sm text-destructive">
              Could not load calls. Check your connection and try again.
            </p>
          )}
          {!error && isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
              Loading calls…
            </div>
          )}
          {!error && !isLoading && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                      <TableRow key={hg.id} className="hover:bg-transparent">
                        {hg.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="group border-b transition-colors hover:bg-muted/40"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="align-middle">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-32 text-center text-muted-foreground"
                        >
                          {rows.length === 0
                            ? "No call sheets yet. Create one from the dashboard."
                            : "No calls match your filters."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col gap-3 border-t bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {table.getRowModel().rows.length
                      ? table.getState().pagination.pageIndex *
                          table.getState().pagination.pageSize +
                        1
                      : 0}
                    –
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                      filteredRows.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {filteredRows.length}
                  </span>
                  {filteredRows.length !== rows.length && (
                    <span> (filtered from {rows.length})</span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
