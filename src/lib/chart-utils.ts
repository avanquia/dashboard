// Tremor Raw chartUtils — https://tremor.so/docs/utilities/chartUtils
export type ColorUtility = "bg" | "stroke" | "fill" | "text";

export const chartColors = {
  blue: { bg: "bg-blue-500", stroke: "stroke-blue-500", fill: "fill-blue-500", text: "text-blue-500" },
  emerald: { bg: "bg-emerald-500", stroke: "stroke-emerald-500", fill: "fill-emerald-500", text: "text-emerald-500" },
  amber: { bg: "bg-amber-500", stroke: "stroke-amber-500", fill: "fill-amber-500", text: "text-amber-500" },
  rose: { bg: "bg-rose-500", stroke: "stroke-rose-500", fill: "fill-rose-500", text: "text-rose-500" },
  violet: { bg: "bg-violet-500", stroke: "stroke-violet-500", fill: "fill-violet-500", text: "text-violet-500" },
  cyan: { bg: "bg-cyan-500", stroke: "stroke-cyan-500", fill: "fill-cyan-500", text: "text-cyan-500" },
  gray: { bg: "bg-zinc-400 dark:bg-zinc-600", stroke: "stroke-zinc-400 dark:stroke-zinc-600", fill: "fill-zinc-400 dark:fill-zinc-600", text: "text-zinc-400 dark:text-zinc-600" },
} as const satisfies Record<string, Record<ColorUtility, string>>;

export type AvailableChartColorsKeys = keyof typeof chartColors;
export const AvailableChartColors = Object.keys(chartColors) as AvailableChartColorsKeys[];

export function constructCategoryColors(categories: string[], colors: AvailableChartColorsKeys[]) {
  const map = new Map<string, AvailableChartColorsKeys>();
  categories.forEach((c, i) => map.set(c, colors[i % colors.length]));
  return map;
}

export function getColorClassName(color: AvailableChartColorsKeys, type: ColorUtility) {
  return chartColors[color]?.[type] ?? chartColors.gray[type];
}
