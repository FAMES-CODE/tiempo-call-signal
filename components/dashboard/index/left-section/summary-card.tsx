"use client";

import { Calendar } from "lucide-react";
import React, { useEffect } from "react";
import useSWR from "swr";

import NewformSheet from "./new-form-sheet";
import { Badge } from "@/components/ui/badge";

type CaseItem = {
  id: number;
  status: string;
  updatedAt: string;
  createdAt: string;
  problemType: string;
  callNumber: string;
  callSim: string;
  customer: {
    CLIENT: string;
  };
  user: {
    username: string;
  };
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SummaryCard() {
  const { data: cases = [] } = useSWR<CaseItem[]>(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/sheets",
    fetcher,
    { refreshInterval: 30000 },
  );

  const [currentTime, setCurrentTime] = React.useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const resolvedCases = cases.filter((c) => c.status === "resolved");
  const pendingCases = cases.filter((c) => c.status === "pending");
  const latestResolvedCase = resolvedCases.reduce<CaseItem | null>((latest, c) => {
    if (!latest) return c;
    return new Date(c.updatedAt).getTime() > new Date(latest.updatedAt).getTime()
      ? c
      : latest;
  }, null);

  const getHoursAgo = (isoDate: string) =>
    Math.max(0, Math.floor((currentTime - new Date(isoDate).getTime()) / 36e5));

  return (
    <div className="flex w-full flex-col gap-0 overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-4 border-b bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Activity &amp; queue</h2>
          <p className="text-sm text-muted-foreground">
            Last case resolved:{" "}
            {latestResolvedCase
              ? new Date(latestResolvedCase.updatedAt).toLocaleString()
              : "No resolved case yet"}
          </p>
        </div>
        <NewformSheet />
      </div>
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Recently resolved</h3>
          <Calendar className="size-5 text-primary" aria-hidden />
        </div>
        <div>
          {resolvedCases.map((c) => (
            <div
              className="mt-3 rounded-xl border bg-muted/40 p-4 first:mt-0"
              key={c.id}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{c.customer.CLIENT}</span>
                <p className="text-sm text-muted-foreground">
                  Resolved {getHoursAgo(c.updatedAt)} hours ago by{" "}
                  <span className="text-foreground">{c.user.username}</span>
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Call reason: {c.problemType}
              </p>
            </div>
          ))}
          {resolvedCases.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">No cases resolved yet</p>
          )}
        </div>
      </div>
      <div className="border-t bg-muted/20 p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h3 className="text-base font-semibold">Waiting for support</h3>
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-2xl font-bold tabular-nums text-amber-900 dark:text-amber-100">
            {pendingCases.length}
          </span>
        </div>
        <div>
          {pendingCases.map((c) => (
            <div
              className="mt-3 min-h-[5.5rem] rounded-xl border border-dashed bg-background/80 p-4 first:mt-0"
              key={c.id}
            >
              <p className="font-medium">
                {c.customer.CLIENT}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  — {c.problemType}
                </span>{" "}
                <span className="text-sm text-muted-foreground">{c.callNumber}</span>{" "}
                <Badge className="text-sm" variant="outline">
                  {c.callSim}
                </Badge>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Case opened {c.createdAt.split("T")[0]} by{" "}
                <span className="text-foreground">{c.user.username}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SummaryCard;
