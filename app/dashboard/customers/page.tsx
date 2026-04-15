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

type CustomerCall = {
  id: number;
  status: string;
  problemType: string | null;
  createdAt: string;
  rate: number | null;
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
  _count: {
    callSheets: number;
  };
  callSheets: CustomerCall[];
};

/** Compute the average rating from rated calls (rate > 0) */
function avgRating(calls: CustomerCall[]): number | null {
  const rated = calls.filter((c) => c.rate && c.rate > 0);
  if (rated.length === 0) return null;
  return rated.reduce((sum, c) => sum + (c.rate ?? 0), 0) / rated.length;
}

/** Read-only mini star display */
function StarDisplay({ value }: { value: number | null }) {
  if (value === null)
    return <span className="text-xs text-muted-foreground">No ratings</span>;

  const rounded = Math.round(value * 2) / 2; // round to nearest 0.5
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rounded >= star;
          const half = !filled && rounded >= star - 0.5;
          return (
            <span key={star} className="relative inline-block size-3.5">
              {/* Empty star base */}
              <Star
                className="size-3.5 text-muted-foreground/30"
                strokeWidth={1.5}
              />
              {/* Filled overlay */}
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

/** Reputation badge for strong signals */
function ReputationBadge({ avg }: { avg: number | null }) {
  if (avg === null) return null;
  if (avg >= 4.5)
    return (
      <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-0 text-[10px] px-1.5 py-0">
        Excellent
      </Badge>
    );
  if (avg >= 3.5)
    return (
      <Badge className="bg-sky-500/15 text-sky-800 dark:text-sky-200 border-0 text-[10px] px-1.5 py-0">
        Good
      </Badge>
    );
  if (avg >= 2.5)
    return (
      <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-0 text-[10px] px-1.5 py-0">
        Average
      </Badge>
    );
  return (
    <Badge className="bg-red-500/15 text-red-800 dark:text-red-200 border-0 text-[10px] px-1.5 py-0">
      Poor
    </Badge>
  );
}

function Page() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const fetchCustomers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + "/api/customers",
      );
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data: Customer[] = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = React.useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return customers;
    return customers.filter((c) =>
      [c.CLIENT, c.CODE_CLIENT, c.CONTACT ?? "", c.TEL ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [customers, query]);

  const totalCalls = React.useMemo(
    () => customers.reduce((sum, c) => sum + c._count.callSheets, 0),
    [customers],
  );

  const totalResolved = React.useMemo(
    () =>
      customers.reduce(
        (sum, c) =>
          sum +
          c.callSheets.filter((call) => call.status === "resolved").length,
        0,
      ),
    [customers],
  );

  /** Global average across all rated calls */
  const globalAvg = React.useMemo(() => {
    const allCalls = customers.flatMap((c) => c.callSheets);
    return avgRating(allCalls);
  }, [customers]);

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Search and review customer profile details and reputation ratings.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm text-muted-foreground">Total customers</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm text-muted-foreground">Total calls</p>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCalls}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm text-muted-foreground">Resolved calls</p>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalResolved}</p>
          </CardContent>
        </Card>
        {/* ── NEW: Global reputation card ── */}
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
            <p className="text-sm text-muted-foreground">Avg. reputation</p>
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
                No rated calls yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name, code, contact, or phone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* ── Table ── */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading customers...
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Reputation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const resolvedCount = customer.callSheets.filter(
                        (c) => c.status === "resolved",
                      ).length;
                      const avg = avgRating(customer.callSheets);
                      return (
                        <TableRow key={customer.id}>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {customer.CODE_CLIENT}
                          </TableCell>
                          <TableCell className="font-medium">
                            {customer.CLIENT}
                          </TableCell>
                          <TableCell>{customer.CONTACT || "—"}</TableCell>
                          <TableCell>{customer.TEL || "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {customer._count.callSheets} total
                              </Badge>
                              <Badge>{resolvedCount} resolved</Badge>
                            </div>
                          </TableCell>

                          {/* ── Reputation column ── */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StarDisplay value={avg} />
                              <ReputationBadge avg={avg} />
                            </div>
                          </TableCell>

                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Link
                                href={`/dashboard/customers/${customer.id}`}
                              >
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
