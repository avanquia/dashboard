"use client";

import { FlagIcon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const DAY = 24 * 60 * 60 * 1000;

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });

// "Today" in the viewer's calendar, as a UTC midnight timestamp.
function today(): number {
  const now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

function useToday(): number | null {
  return useSyncExternalStore(
    () => () => {},
    today,
    () => null,
  );
}

export function Deadline({ date }: { date: string }) {
  const due = Date.parse(`${date}T00:00:00Z`);
  const now = useToday();
  const days = now === null ? null : Math.round((due - now) / DAY);

  const label =
    days === null
      ? "\u00a0"
      : days > 1
        ? `faltam ${days} dias`
        : days === 1
          ? "falta 1 dia"
          : days === 0
            ? "é hoje"
            : `${-days} ${days === -1 ? "dia" : "dias"} de atraso`;

  return (
    <div className="step-in flex shrink-0 items-center justify-between gap-3 rounded-xl border bg-card/40 px-4 py-3 sm:flex-col sm:items-end sm:justify-start sm:gap-1 sm:text-end">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
        <FlagIcon className="size-3" />
        Deadline
      </span>
      <span className="font-mono text-2xl tabular-nums tracking-tight">{dateFmt.format(due)}</span>
      <span
        className={cn(
          "text-xs",
          days !== null && days < 0 ? "text-destructive-foreground" : days !== null && days <= 7 ? "text-warning-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}
