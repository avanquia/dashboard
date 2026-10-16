// Tremor Raw DonutChart (trimmed) — https://tremor.so/docs/visualizations/donut-chart
"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  AvailableChartColors,
  type AvailableChartColorsKeys,
  constructCategoryColors,
  getColorClassName,
} from "@/lib/chart-utils";
import { cn } from "@/lib/utils";

type DonutChartProps = React.HTMLAttributes<HTMLDivElement> & {
  data: Record<string, unknown>[];
  category: string;
  value: string;
  colors?: AvailableChartColorsKeys[];
  valueFormatter?: (value: number) => string;
  label?: string;
  showLabel?: boolean;
};

export function DonutChart({
  data,
  category,
  value,
  colors = AvailableChartColors,
  valueFormatter = (v) => v.toString(),
  label,
  showLabel = false,
  className,
  ...props
}: DonutChartProps) {
  const categories = data.map((d) => String(d[category]));
  const categoryColors = constructCategoryColors(categories, colors);
  const total = data.reduce((sum, d) => sum + Number(d[value]), 0);

  return (
    <div className={cn("relative size-40", className)} {...props}>
      <ResponsiveContainer>
        <PieChart>
          {showLabel && (
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-mono text-lg">
              {label ?? valueFormatter(total)}
            </text>
          )}
          <Pie
            data={data.map((d) => ({
              ...d,
              className: getColorClassName(categoryColors.get(String(d[category]))!, "fill"),
            }))}
            dataKey={value}
            nameKey={category}
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke=""
            strokeLinejoin="round"
            className="stroke-background"
            isAnimationActive={false}
          />
          <Tooltip
            isAnimationActive={false}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="flex items-center gap-2 rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
                  <span className={cn("size-2 rounded-sm", getColorClassName(categoryColors.get(String(payload[0].name))!, "bg"))} />
                  <span className="text-muted-foreground">{payload[0].name}</span>
                  <span className="ms-4 font-mono tabular-nums">{valueFormatter(Number(payload[0].value))}</span>
                </div>
              ) : null
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
