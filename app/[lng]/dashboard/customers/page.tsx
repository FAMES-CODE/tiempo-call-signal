"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  Users,
  PhoneCall,
  CheckCircle2,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { apiUrl } from "@/lib/api-url";
import { useLocalePrefix, withLocalePath } from "@/lib/locale-path";
import { useTranslation } from "react-i18next";

type Customer = {
  id: number;
  CLIENT: string;
  CODE_CLIENT: string;
  CONTACT: string | null;
  SOLDE: string | number;
  TEL: string | null;
  _count: { callSheets: number };
  resolvedCount: number;
  avgRating: number | null;
};

type CustomersResponse = {
  items: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalCustomers: number;
    totalCalls: number;
    totalResolved: number;
    globalAvgRating: number | null;
  };
};

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 350;

function StarDisplay({ value }: { value: number | null }) {
  const { t } = useTranslation("common");
  if (value === null)
    return (
      <span className="text-xs text-muted-foreground">
        {t("common.dashboard.customers.noRatings")}
      </span>
    );

  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rounded >= star;
          const half = !filled && rounded >= star - 0.5;
          return (
            <span key={star} className="relative inline-block size-3.5">
              <Star
                className="size-3.5 text-muted-foreground/30"
                strokeWidth={1.5}
              />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? "100%" : "50%" }}
                >
                  <Star
                    className="size-3.5 fill-amber-400 text-amber-400"
                    strokeWidth={1.5}
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span className="text-xs font-medium tabular-nums text-muted-foreground">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function ReputationBadge({ avg }: { avg: number | null }) {
  const { t } = useTranslation("common");
  if (avg === null) return null;
  if (avg >= 4.5)
    return (
      <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-0 text-[10px] px-1.5 py-0">
        {t("common.dashboard.customers.reputationExcellent")}
      </Badge>
    );
  if (avg >= 3.5)
    return (
      <Badge className="bg-sky-500/15 text-sky-800 dark:text-sky-200 border-0 text-[10px] px-1.5 py-0">
        {t("common.dashboard.customers.reputationGood")}
      </Badge>
    );
  if (avg >= 2.5)
    return (
      <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-0 text-[10px] px-1.5 py-0">
        {t("common.dashboard.customers.reputationAverage")}
      </Badge>
    );
  return (
    <Badge className="bg-red-500/15 text-red-800 dark:text-red-200 border-0 text-[10px] px-1.5 py-0">
      {t("common.dashboard.customers.reputationPoor")}
    </Badge>
  );
}

function Page() {
  const { t } = useTranslation("common");
  const prefix = useLocalePrefix();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [summary, setSummary] = React.useState<CustomersResponse["summary"] | null>(
    null,
  );
  const [pagination, setPagination] = React.useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchCustomers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (debouncedQuery) params.set("search", debouncedQuery);

      const res = await fetch(apiUrl(`/api/customers?${params}`));
      if (!res.ok) throw new Error(t("common.dashboard.customers.failedFetch"));
      const data: CustomersResponse = await res.json();
      setCustomers(data.items);
      setSummary(data.summary);
      setPagination({
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        total: data.pagination.total,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedQuery, t]);

  React.useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const globalAvg = summary?.globalAvgRating ?? null;

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          {t("common.dashboard.customers.pageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("common.dashboard.customers.pageDescription")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm text-muted-foreground">
              {t("common.dashboard.customers.statTotalCustomers")}
            </p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary?.totalCustomers ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm text-muted-foreground">
              {t("common.dashboard.customers.statTotalCalls")}
            </p>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary?.totalCalls ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm text-muted-foreground">
              {t("common.dashboard.customers.statResolvedCalls")}
            </p>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary?.totalResolved ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "border",
            globalAvg !== null && globalAvg >= 4
              ? "border-emerald-500/30 bg-emerald-500/5"
              : globalAvg !== null && globalAvg < 2.5
                ? "border-red-500/30 bg-red-500/5"
                : "border-amber-500/20 bg-amber-500/5",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm text-muted-foreground">
              {t("common.dashboard.customers.statAvgReputation")}
            </p>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </CardHeader>
          <CardContent className="space-y-1">
            {globalAvg !== null ? (
              <>
                <p className="text-3xl font-bold tabular-nums">
                  {globalAvg.toFixed(1)}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    / 5
                  </span>
                </p>
                <StarDisplay value={globalAvg} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("common.dashboard.customers.noRatedCalls")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={t("common.dashboard.customers.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("common.dashboard.customers.loading")}
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("common.dashboard.customers.tableCode")}
                      </TableHead>
                      <TableHead>
                        {t("common.dashboard.customers.tableCustomer")}
                      </TableHead>
                      <TableHead>
                        {t("common.dashboard.customers.tableContact")}
                      </TableHead>
                      <TableHead>
                        {t("common.dashboard.customers.tablePhone")}
                      </TableHead>
                      <TableHead>
                        {t("common.dashboard.customers.tableCalls")}
                      </TableHead>
                      <TableHead>
                        {t("common.dashboard.customers.tableReputation")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("common.dashboard.customers.tableActions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-muted-foreground"
                        >
                          {t("common.dashboard.customers.noCustomersFound")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {customer.CODE_CLIENT}
                          </TableCell>
                          <TableCell className="font-medium">
                            {customer.CLIENT}
                          </TableCell>
                          <TableCell>
                            {customer.CONTACT ||
                              t("common.dashboard.customers.dash")}
                          </TableCell>
                          <TableCell>
                            {customer.TEL ||
                              t("common.dashboard.customers.dash")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {customer._count.callSheets}{" "}
                                {t("common.dashboard.customers.badgeTotal")}
                              </Badge>
                              <Badge>
                                {customer.resolvedCount}{" "}
                                {t("common.dashboard.customers.badgeResolved")}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StarDisplay value={customer.avgRating} />
                              <ReputationBadge avg={customer.avgRating} />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Link
                                href={withLocalePath(
                                  prefix,
                                  `/dashboard/customers/${customer.id}`,
                                )}
                              >
                                {t("common.dashboard.customers.view")}
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <p className="text-muted-foreground">
                    {pagination.total} client(s) — page {pagination.page} /{" "}
                    {pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 1 || isLoading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="size-4" />
                      Précédent
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        page >= pagination.totalPages || isLoading
                      }
                      onClick={() =>
                        setPage((p) =>
                          Math.min(pagination.totalPages, p + 1),
                        )
                      }
                    >
                      Suivant
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
