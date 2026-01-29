"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export const description = "A donut chart with text";

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function MiniChart() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <div className="p-4 border-none border-0">
      <div className="flex flex-col items-start">
        <h1 className="text-2xl">Performance over time</h1>
        <h2>150 calls statistics</h2>
      </div>
      <div className="items-center grid grid-cols-2 justify-between gap-4">
        <div className="items-center pb-0">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-chart-1 rounded-full animate-pulse"></div>
              <h1 className="text-lg font-semibold">
                Total case : {totalVisitors.toLocaleString()}
              </h1>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-chart-2 rounded-full animate-pulse"></div>
              <h1 className="text-lg font-semibold">
                Total case resolved : {totalVisitors.toLocaleString()}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-chart-3 rounded-full animate-pulse"></div>
              <h1 className="text-lg font-semibold">
                Performance increase: 24%
              </h1>
            </div>
          </div>
        </div>

        <ChartContainer
          config={chartConfig}
          className=" aspect-square max-h-[250px] w-full justify-self-end "
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
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
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
}
