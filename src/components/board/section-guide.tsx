import { type LucideIcon, ScaleIcon, ShieldCheckIcon, WrenchIcon } from "lucide-react";
import type { Board } from "@/lib/types";

const icons: Record<string, LucideIcon> = {
  Harness: WrenchIcon,
  Security: ShieldCheckIcon,
  Compliance: ScaleIcon,
};

/** Explains what each front of the engagement covers and why it matters. */
export function SectionGuide({ sections }: { sections: NonNullable<Board["sections"]> }) {
  const explained = sections.filter((s) => s.what || s.why);
  if (explained.length === 0) return null;

  return (
    <div className="step-in mb-10 grid gap-3 md:grid-cols-3">
      {explained.map((s) => {
        const Icon = icons[s.name];
        return (
          <article key={s.name} className="flex flex-col gap-4 rounded-2xl border bg-card/40 p-5">
            <header className="flex items-center gap-2.5">
              {Icon && (
                <span className="flex size-8 items-center justify-center rounded-lg border text-muted-foreground">
                  <Icon className="size-4" />
                </span>
              )}
              <h2 className="font-serif text-2xl tracking-tight">{s.name}</h2>
            </header>
            {s.what && (
              <div className="flex flex-col gap-1">
                <h3 className="text-muted-foreground text-xs uppercase tracking-wider">O que estamos fazendo</h3>
                <p className="text-sm leading-relaxed">{s.what}</p>
              </div>
            )}
            {s.why && (
              <div className="flex flex-col gap-1">
                <h3 className="text-muted-foreground text-xs uppercase tracking-wider">Por que importa</h3>
                <p className="text-sm leading-relaxed">{s.why}</p>
              </div>
            )}
            {s.note && <p className="mt-auto border-t pt-3 text-muted-foreground text-xs leading-relaxed">{s.note}</p>}
          </article>
        );
      })}
    </div>
  );
}
