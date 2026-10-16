import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BoardPlaceholder, KanbanBoard } from "@/components/board/kanban-board";
import { LockButton } from "@/components/board/lock-button";
import { PasswordGate } from "@/components/board/password-gate";
import { isAuthorized } from "@/lib/auth";
import { clientSlugs, getClient } from "@/lib/clients";

export function generateStaticParams() {
  return clientSlugs.map((client) => ({ client }));
}

export async function generateMetadata({ params }: PageProps<"/[client]">): Promise<Metadata> {
  const client = getClient((await params).client);
  return { title: client ? `${client.name} — Avanquia` : "Avanquia", robots: { index: false } };
}

export default async function ClientPage({ params }: PageProps<"/[client]">) {
  const client = getClient((await params).client);
  if (!client) notFound();

  return (
    <main className="grain relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-8 sm:py-12">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm tracking-wide">Avanquia · {client.name}</p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">{client.board.title}</h1>
          {client.board.description && (
            <p className="max-w-xl text-[15px] text-muted-foreground leading-relaxed">{client.board.description}</p>
          )}
        </div>
      </header>

      <Suspense fallback={<BoardPlaceholder />}>
        <Gate slug={client.slug} />
      </Suspense>
    </main>
  );
}

// Reads the session cookie, so it streams in at request time. Board content
// only reaches the browser once the password has been accepted.
async function Gate({ slug }: { slug: string }) {
  const client = getClient(slug)!;
  if (!(await isAuthorized(client))) {
    return (
      <>
        <BoardPlaceholder />
        <PasswordGate slug={client.slug} clientName={client.name} />
      </>
    );
  }

  const updated = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${client.board.updatedAt}T00:00:00Z`),
  );

  return (
    <>
      <div className="-mt-6 mb-6 flex items-center justify-between gap-4 text-muted-foreground text-xs">
        <span>Atualizado em {updated}</span>
        <LockButton slug={client.slug} />
      </div>
      <KanbanBoard board={client.board} />
    </>
  );
}
