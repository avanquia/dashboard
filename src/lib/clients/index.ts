import "server-only";
import type { Client } from "@/lib/types";
import { alufacil } from "./alufacil";

const clients: Record<string, Client> = {
  [alufacil.slug]: alufacil,
};

export const clientSlugs = Object.keys(clients);

export function getClient(slug: string): Client | undefined {
  return clients[slug];
}
