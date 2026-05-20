"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import useSWR from "swr";
import { useTranslation } from "react-i18next";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type StatsResponse = {
  totalCalls: number;
  totalResolved: number;
  totalPending: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function MiniChart() {
  const { t } = useTranslation("common");

  const chartConfig = React.useMemo(
    () =>
      ({
        resolved: {
          label: t("common.dashboard.overview.chart.resolvedLabel"),
          color: "var(--chart-2)",
        },
        pending: {
          label: t("common.dashboard.overview.chart.pendingLabel"),
          color: "var(--color-destructive)",
        },
      }) satisfies ChartConfig,
    [t],
  );

  const { data, error } = useSWR<StatsResponse>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stats`,
    fetcher,
    { refreshInterval: 10000 },
  );

  if (error) {
    console.error(error);
  }

  const totalCalls = data?.totalCalls ?? 0;
  const totalResolved = data?.totalResolved ?? 0;
  const pending =
    data?.totalPending ?? Math.max(0, totalCalls - totalResolved);

  const chartData = React.useMemo(
    () => [
      {
        key: "resolved",
        name: "resolved",
        value: totalResolved,
        fill: "var(--color-chart-1)",
      },
      {
        key: "pending",
        name: "pending",
        value: pending,
        fill: "var(--color-destructive)",
      },
    ],
    [totalResolved, pending],
  );

  const total = totalResolved + pending;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <ul className="flex min-w-0 flex-1 flex-col gap-3 text-sm">
        <li className="flex items-center gap-3">
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: "var(--chart-1)" }}
            aria-hidden
          />
          <span className="text-muted-foreground">
            {t("common.dashboard.overview.chart.casesResolved")}
          </span>
          <span className="ml-auto font-semibold tabular-nums text-foreground">
            {totalResolved}
          </span>
        </li>
        <li className="flex items-center gap-3">
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: "var(--color-destructive)" }}
            aria-hidden
          />
          <span className="text-muted-foreground">
            {t("common.dashboard.overview.chart.pending")}
          </span>
          <span className="ml-auto font-semibold tabular-nums text-foreground">
            {pending}
          </span>
        </li>
      </ul>

      <div className="mx-auto w-full max-w-[220px] shrink-0 sm:mx-0">
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("common.dashboard.overview.chart.empty")}
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-square w-full">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={72}
                strokeWidth={2}
                stroke="hsl(var(--background))"
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {total}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-xs"
                          >
                            {t("common.dashboard.overview.chart.total")}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
