"use client";

import { BarChart } from "@/components/tremor/bar-chart";
import { DonutChart } from "@/components/tremor/donut-chart";
import { type AvailableChartColorsKeys, getColorClassName } from "@/lib/chart-utils";
import { type Board, type Card, COLUMNS, PRIORITY_LABEL, type Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

const columnColors: Record<Card["column"], AvailableChartColorsKeys> = {
  backlog: "gray",
  doing: "blue",
  review: "amber",
  done: "emerald",
};


export function BoardCharts({ board, cards }: { board: Board; cards: Card[] }) {
  const columns = (board.columns ?? COLUMNS).filter((col) => board.cards.some((c) => c.column === col.id));

  const sections = board.sections?.map((s) => s.name) ?? [];
  const bySection = sections.map((name) => {
    const row: Record<string, string | number> = { section: name };
    for (const col of columns) row[col.title] = board.cards.filter((c) => c.section === name && c.column === col.id).length;
    return row;
  });

  const pending = cards.filter((c) => c.column !== "done");
  const priorities: [Priority | undefined, AvailableChartColorsKeys][] = [
    ["P0", "rose"],
    ["P1", "amber"],
    ["P2", "cyan"],
    [undefined, "gray"],
  ];
  const byPriority = priorities
    .map(([p, color]) => ({
      color,
      name: p ? `${p} · ${PRIORITY_LABEL[p]}` : "Sem prioridade",
      count: pending.filter((c) => c.priority === p).length,
    }))
    .filter((d) => d.count > 0);

  return (
    <div className="step-in mb-8 grid gap-4 lg:grid-cols-[2fr_1fr]">
      {bySection.length > 0 && (
        <section className="rounded-2xl border bg-card/40 p-4">
          <h2 className="mb-2 font-medium text-sm">Status por seção</h2>
          <BarChart
            className="h-56"
            data={bySection}
            index="section"
            categories={columns.map((c) => c.title)}
            colors={columns.map((c) => columnColors[c.id])}
            type="stacked"
            layout="vertical"
            yAxisWidth={88}
          />
        </section>
      )}
      <section className="rounded-2xl border bg-card/40 p-4">
        <h2 className="mb-4 font-medium text-sm">Pendências por prioridade</h2>
        {byPriority.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground text-xs">Nada pendente.</p>
        ) : (
          <div className="flex items-center gap-6">
            <DonutChart
              data={byPriority}
              category="name"
              value="count"
              colors={byPriority.map((d) => d.color)}
              showLabel
              className="size-36 shrink-0"
            />
            <ul className="flex flex-col gap-2 text-sm">
              {byPriority.map((d) => (
                <li key={d.name} className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-sm", getColorClassName(d.color, "bg"))} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="ms-auto ps-4 font-mono tabular-nums">{d.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
