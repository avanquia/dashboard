import { ContactDialog } from "@/components/contact-dialog";
import { Stage } from "@/components/stage";

const WORD = "Avanquia";

export default function Home() {
  return (
    <Stage>
      <section className="mark relative z-2 -mt-[6svh] flex flex-col items-center text-center">
        <h1 className="relative">
          <span className="sr-only">{WORD}</span>
          <span
            aria-hidden="true"
            className="intro-word -mb-[.18em] inline-flex overflow-hidden pb-[.18em] font-(family-name:--font-serif) text-[calc(var(--L)*.72)] text-foreground leading-none tracking-[-.02em]"
          >
            {WORD.split("").map((ch, i) => (
              <span key={i} className="intro-letter inline-block" style={{ "--i": i } as React.CSSProperties}>
                {ch}
              </span>
            ))}
          </span>
        </h1>

        <p className="mt-(--gap-line) overflow-hidden pt-[.1em] pb-[.2em] text-(length:--t-line) text-foreground/80 leading-none tracking-[-.01em]">
          <span className="intro-line inline-block">Consultoria de IA para empresas.</span>
        </p>
        <p className="mt-(--gap-sub) overflow-hidden pb-[.1em] text-(length:--t-sub) text-muted-foreground leading-[1.4]">
          <span className="intro-sub inline-block">Da estratégia à operação, com inteligência que gera resultado.</span>
        </p>

        <div className="intro-show absolute top-full left-1/2 mt-[calc(var(--L)*.9)] flex w-max -translate-x-1/2 flex-col items-center">
          <ContactDialog />
        </div>
      </section>

      <footer className="foot intro-show absolute inset-x-0 bottom-[clamp(26px,5.2vh,58px)] z-2 text-center text-[12.5px] text-muted-foreground/70 tracking-[.02em]">
        © 2026 Avanquia
      </footer>
    </Stage>
  );
}
