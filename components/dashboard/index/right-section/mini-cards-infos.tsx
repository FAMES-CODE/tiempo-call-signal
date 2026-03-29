"use client";

import { CheckCircle2, CircleDashed, PhoneIncoming } from "lucide-react";
import useSWR from "swr";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsResponse = {
  totalCalls: number;
  totalResolved: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function MiniCards() {
  const { data, error } = useSWR<StatsResponse>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stats`,
    fetcher,
    {
      refreshInterval: 10000,
    },
  );
  if (error) console.error(error);

  const totalCalls = data?.totalCalls ?? 0;
  const totalResolved = data?.totalResolved ?? 0;
  const pending = Math.max(0, totalCalls - totalResolved);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card
        className={cn(
          "overflow-hidden border-0 bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-md",
        )}
      >
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-primary-foreground/90">
                Calls received
              </p>
              <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight">
                {totalCalls}
              </p>
            </div>
            <div className="rounded-xl bg-primary-foreground/15 p-2.5">
              <PhoneIncoming className="size-6" aria-hidden />
            </div>
          </div>
          <p className="text-xs text-primary-foreground/80">
            Total call sheets you created.
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolved</p>
              <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight">
                {totalResolved}
              </p>
            </div>
            <div className="rounded-xl bg-chart-1/15 p-2.5 text-chart-1">
              <CheckCircle2 className="size-6" aria-hidden />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Cases you marked as resolved.
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-sm sm:col-span-2 lg:col-span-1">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight">
                {pending}
              </p>
            </div>
            <div className="rounded-xl bg-chart-2/15 p-2.5 text-chart-2">
              <CircleDashed className="size-6" aria-hidden />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Open cases from your calls (total − resolved).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default MiniCards;
