// Tremor Raw BarChart (trimmed) — https://tremor.so/docs/visualizations/bar-chart
"use client";

import { Bar, CartesianGrid, Legend, BarChart as RechartsBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AvailableChartColors,
  type AvailableChartColorsKeys,
  constructCategoryColors,
  getColorClassName,
} from "@/lib/chart-utils";
import { cn } from "@/lib/utils";

type BarChartProps = React.HTMLAttributes<HTMLDivElement> & {
  data: Record<string, unknown>[];
  index: string;
  categories: string[];
  colors?: AvailableChartColorsKeys[];
  valueFormatter?: (value: number) => string;
  type?: "default" | "stacked" | "percent";
  layout?: "vertical" | "horizontal";
  showLegend?: boolean;
  allowDecimals?: boolean;
  yAxisWidth?: number;
};

export function BarChart({
  data,
  index,
  categories,
  colors = AvailableChartColors,
  valueFormatter = (v) => v.toString(),
  type = "default",
  layout = "horizontal",
  showLegend = true,
  allowDecimals = false,
  yAxisWidth = 56,
  className,
  ...props
}: BarChartProps) {
  const categoryColors = constructCategoryColors(categories, colors);
  const stacked = type !== "default";
  const vertical = layout === "vertical";
  const axis = { stroke: "", fill: "", tickLine: false, axisLine: false, fontSize: 12 } as const;

  return (
    <div className={cn("h-72 w-full", className)} {...props}>
      <ResponsiveContainer>
        <RechartsBarChart
          data={data}
          layout={layout}
          stackOffset={type === "percent" ? "expand" : undefined}
          margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            className="stroke-border stroke-1"
            horizontal={!vertical}
            vertical={vertical}
            strokeDasharray="3 3"
          />
          <XAxis
            {...axis}
            className="fill-muted-foreground"
            {...(vertical
              ? { type: "number", allowDecimals, tickFormatter: (v: number) => (type === "percent" ? `${Math.round(v * 100)}%` : valueFormatter(v)) }
              : { dataKey: index, type: "category", interval: 0 })}
          />
          <YAxis
            {...axis}
            width={yAxisWidth}
            className="fill-muted-foreground"
            {...(vertical
              ? { dataKey: index, type: "category" }
              : { type: "number", allowDecimals, tickFormatter: (v: number) => (type === "percent" ? `${Math.round(v * 100)}%` : valueFormatter(v)) })}
          />
          <Tooltip
            cursor={{ className: "fill-muted/60" }}
            isAnimationActive={false}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="rounded-md border bg-popover text-sm shadow-md">
                  <p className="border-b px-3 py-2 font-medium">{label}</p>
                  <div className="space-y-1 px-3 py-2">
                    {payload.map((p) => (
                      <div key={String(p.dataKey)} className="flex items-center justify-between gap-6">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <span className={cn("size-2 rounded-sm", getColorClassName(categoryColors.get(String(p.dataKey))!, "bg"))} />
                          {p.dataKey}
                        </span>
                        <span className="font-mono tabular-nums">{valueFormatter(Number(p.value))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            }
          />
          {showLegend && (
            <Legend
              verticalAlign="top"
              height={32}
              content={() => (
                <ul className="flex flex-wrap justify-end gap-3 text-muted-foreground text-xs">
                  {categories.map((c) => (
                    <li key={c} className="flex items-center gap-1.5">
                      <span className={cn("size-2 rounded-sm", getColorClassName(categoryColors.get(c)!, "bg"))} />
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            />
          )}
          {categories.map((c) => (
            <Bar
              key={c}
              dataKey={c}
              name={c}
              stackId={stacked ? "stack" : undefined}
              className={getColorClassName(categoryColors.get(c)!, "fill")}
              fill=""
              isAnimationActive={false}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
