"use client";

import { CalendarIcon, CheckIcon, FolderGit2Icon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet";
import { type Board, type Card, COLUMNS, PRIORITY_LABEL, type Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });

function formatDate(iso: string) {
  return dateFmt.format(new Date(`${iso}T00:00:00Z`)).replace(".", "");
}

const priorityVariant: Record<Priority, "error" | "warning" | "secondary"> = {
  P0: "error",
  P1: "warning",
  P2: "secondary",
};

const priorityRank = (c: Card) => (c.priority ? Number(c.priority[1]) : 9);

const gridCols: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

const dotColor: Record<Card["column"], string> = {
  backlog: "bg-muted-foreground/50",
  doing: "bg-info",
  review: "bg-warning",
  done: "bg-success",
};

export function KanbanBoard({ board }: { board: Board }) {
  const [open, setOpen] = useState<Card | null>(null);
  const [section, setSection] = useState<string | null>(null);
  const columns = board.columns ?? COLUMNS;
  const visible = section ? board.cards.filter((c) => c.section === section) : board.cards;
  const done = visible.filter((c) => c.column === "done").length;
  const pct = visible.length ? Math.round((done / visible.length) * 100) : 0;
  const sectionInfo = board.sections?.find((s) => s.name === section);

  return (
    <>
      {board.sections && board.sections.length > 0 && (
        <div className="step-in mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[{ name: null as string | null, label: "Todos" }, ...board.sections.map((s) => ({ name: s.name, label: s.name }))].map(
            ({ name, label }) => {
              const cards = name ? board.cards.filter((c) => c.section === name) : board.cards;
              const ok = cards.filter((c) => c.column === "done").length;
              const active = section === name;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSection(name)}
                  className={cn(
                    "flex flex-col gap-1 rounded-xl border p-3 text-start outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-foreground/20 bg-accent" : "bg-card/40",
                  )}
                >
                  <span className="text-muted-foreground text-xs">{label}</span>
                  <span className="font-mono text-lg tabular-nums">
                    {ok}
                    <span className="text-muted-foreground text-sm">/{cards.length}</span>
                  </span>
                </button>
              );
            },
          )}
        </div>
      )}

      <div className="step-in mb-8 flex flex-col gap-3 sm:max-w-sm">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">Progresso {section ? `· ${section}` : "geral"}</span>
          <span className="font-mono tabular-nums">{pct}%</span>
        </div>
        <Progress value={pct} aria-label="Progresso" />
        {sectionInfo?.description && (
          <p className="text-muted-foreground text-xs leading-relaxed">{sectionInfo.description}</p>
        )}
      </div>

      <div
        className={cn(
          "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 lg:grid lg:overflow-visible",
          gridCols[columns.length],
        )}
      >
        {columns.map((col, i) => {
          const cards = visible
            .filter((c) => c.column === col.id)
            .sort((a, b) => priorityRank(a) - priorityRank(b));
          return (
            <section
              key={col.id}
              className="step-in flex w-[80vw] max-w-80 shrink-0 snap-start flex-col self-start rounded-2xl border bg-card/40 p-2 sm:w-72 lg:w-auto lg:max-w-none"
              style={{ animationDelay: `${80 + i * 60}ms` }}
            >
              <header className="flex items-center gap-2 px-2 pt-1.5 pb-3">
                <span className={cn("size-1.5 rounded-full", dotColor[col.id])} />
                <h2 className="font-medium text-sm">{col.title}</h2>
                <span className="ms-auto font-mono text-muted-foreground text-xs tabular-nums">
                  {cards.length}
                </span>
              </header>
              <div className={cn("grid gap-2", columns.length <= 2 && "xl:grid-cols-2")}>
                {cards.length === 0 ? (
                  <p className="col-span-full rounded-xl border border-dashed px-3 py-6 text-center text-muted-foreground text-xs">
                    {col.hint}
                  </p>
                ) : (
                  cards.map((card) => <KanbanCard key={card.id} card={card} onOpen={() => setOpen(card)} />)
                )}
              </div>
            </section>
          );
        })}
      </div>

      {board.notes && (
        <aside className="step-in mt-10 max-w-2xl border-t pt-6">
          <h2 className="mb-3 text-muted-foreground text-xs uppercase tracking-wider">{board.notes.title}</h2>
          <ul className="flex list-disc flex-col gap-1.5 ps-4 text-muted-foreground text-sm leading-relaxed">
            {board.notes.items.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </aside>
      )}

      <Sheet open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetPopup>{open && <CardDetails card={open} columnTitle={columns.find((c) => c.id === open.column)?.title} />}</SheetPopup>
      </Sheet>
    </>
  );
}

function Meta({ card }: { card: Card }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="font-mono text-muted-foreground text-xs">{card.id}</span>
      {card.priority && (
        <Badge variant={priorityVariant[card.priority]} size="sm">
          {card.priority}
        </Badge>
      )}
      {card.section && (
        <Badge variant="outline" size="sm">
          {card.section}
        </Badge>
      )}
      {card.tags?.map((t) => (
        <Badge key={t} variant="secondary" size="sm">
          {t}
        </Badge>
      ))}
    </div>
  );
}

function Details({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-3 text-[15px] leading-relaxed">
      {text.split(/\n\s*\n/).map((block, i) => {
        const lines = block.split("\n");
        const items = lines.filter((l) => l.startsWith("- "));
        const prose = lines.filter((l) => !l.startsWith("- ")).join(" ");
        return (
          <div key={i} className="flex flex-col gap-2">
            {prose && <p>{prose}</p>}
            {items.length > 0 && (
              <ul className="flex list-disc flex-col gap-1 ps-5">
                {items.map((l) => (
                  <li key={l}>{l.slice(2)}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ card, onOpen }: { card: Card; onOpen: () => void }) {
  const total = card.checklist?.length ?? 0;
  const checked = card.checklist?.filter((i) => i.done).length ?? 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col gap-2.5 rounded-xl border bg-card p-3.5 text-start shadow-xs/5 outline-none transition-colors hover:border-foreground/12 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Meta card={card} />
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-sm leading-snug">{card.title}</h3>
        {(card.summary ?? card.details) && (
          <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
            {card.summary ?? card.details?.replace(/\n- /g, " · ")}
          </p>
        )}
      </div>
      {(card.due || card.repo || total > 0) && (
        <div className="flex items-center gap-3 text-muted-foreground text-xs">
          {card.repo && (
            <span className="inline-flex items-center gap-1">
              <FolderGit2Icon className="size-3" />
              {card.repo}
            </span>
          )}
          {card.due && (
            <span className="inline-flex items-center gap-1">
              <CalendarIcon className="size-3" />
              {formatDate(card.due)}
            </span>
          )}
          {total > 0 && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <CheckIcon className="size-3" />
              {checked}/{total}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

function CardDetails({ card, columnTitle }: { card: Card; columnTitle?: string }) {
  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <span className={cn("size-1.5 rounded-full", dotColor[card.column])} />
          {columnTitle}
          {card.due && <span>· {formatDate(card.due)}</span>}
        </div>
        <SheetTitle className="font-normal text-2xl tracking-tight">{card.title}</SheetTitle>
        {card.summary && <SheetDescription className="text-[15px] leading-relaxed">{card.summary}</SheetDescription>}
      </SheetHeader>
      <SheetPanel className="flex flex-col gap-6">
        <Meta card={card} />
        {(card.repo || card.priority) && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
            {card.repo && (
              <>
                <dt className="text-muted-foreground">Repositório</dt>
                <dd>{card.repo}</dd>
              </>
            )}
            {card.priority && (
              <>
                <dt className="text-muted-foreground">Prioridade</dt>
                <dd>
                  {card.priority} · {PRIORITY_LABEL[card.priority]}
                </dd>
              </>
            )}
          </dl>
        )}
        {card.details && <Details text={card.details} />}
        {card.doneWhen && (
          <div className="flex flex-col gap-1.5 rounded-xl border bg-muted/50 p-4">
            <h4 className="text-muted-foreground text-xs uppercase tracking-wider">Pronto quando</h4>
            <p className="text-[15px] leading-relaxed">{card.doneWhen}</p>
          </div>
        )}
        {card.checklist && card.checklist.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="text-muted-foreground text-xs uppercase tracking-wider">Entregáveis</h4>
            <ul className="flex flex-col gap-1.5">
              {card.checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-sm border",
                      item.done && "border-success/40 bg-success/16 text-success-foreground",
                    )}
                  >
                    {item.done && <CheckIcon className="size-3" />}
                  </span>
                  <span className={cn(item.done && "text-muted-foreground line-through")}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </SheetPanel>
    </>
  );
}

/** Content-free stand-in rendered behind the password gate. */
export function BoardPlaceholder() {
  const counts = [3, 2, 2, 4];
  return (
    <div aria-hidden className="pointer-events-none grid select-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {COLUMNS.map((col, i) => (
        <section key={col.id} className="flex flex-col gap-2 rounded-2xl border bg-card/40 p-2">
          <div className="flex items-center gap-2 px-2 pt-1.5 pb-3">
            <span className={cn("size-1.5 rounded-full", dotColor[col.id])} />
            <span className="font-medium text-sm">{col.title}</span>
          </div>
          {Array.from({ length: counts[i] }, (_, j) => (
            <div key={j} className="flex flex-col gap-2 rounded-xl border bg-card p-3.5">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3.5 w-4/5 rounded bg-foreground/10" />
              <div className="h-3 w-3/5 rounded bg-muted" />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
