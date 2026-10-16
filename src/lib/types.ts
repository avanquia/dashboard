export type ColumnId = "backlog" | "doing" | "review" | "done";

export type Column = { id: ColumnId; title: string; hint: string };

export const COLUMNS: Column[] = [
  { id: "backlog", title: "Planejado", hint: "Próximas etapas" },
  { id: "doing", title: "Em andamento", hint: "Sendo executado agora" },
  { id: "review", title: "Em validação", hint: "Aguardando revisão" },
  { id: "done", title: "Concluído", hint: "Entregue" },
];

export type Priority = "P0" | "P1" | "P2";

export const PRIORITY_LABEL: Record<Priority, string> = {
  P0: "Urgente",
  P1: "Próximo ciclo",
  P2: "Depois",
};

export type Card = {
  /** Unique, human-readable reference (e.g. HAR-01). */
  id: string;
  column: ColumnId;
  title: string;
  /** Grouping used by the section filter (e.g. Harness, Security). */
  section?: string;
  repo?: string;
  priority?: Priority;
  summary?: string;
  /** Long-form detail. Paragraphs split by blank lines; lines starting with "- " become a list. */
  details?: string;
  /** Acceptance criterion ("Pronto quando"). */
  doneWhen?: string;
  tags?: string[];
  /** ISO date (yyyy-mm-dd). */
  due?: string;
  checklist?: { label: string; done: boolean }[];
};

export type Board = {
  title: string;
  description?: string;
  updatedAt: string;
  /** Columns shown on this board, in order. Defaults to COLUMNS. */
  columns?: Column[];
  /** Ordered list of sections for the filter; omitted hides the filter. */
  sections?: { name: string; description?: string }[];
  /** Caveats shown under the board. */
  notes?: { title: string; items: string[] };
  cards: Card[];
};

export type Client = {
  slug: string;
  name: string;
  /** Env var that holds this client's access password. */
  passwordEnv: string;
  board: Board;
};
