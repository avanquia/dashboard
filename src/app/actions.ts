"use server";

import { refresh } from "next/cache";
import { checkPassword, grantAccess, revokeAccess } from "@/lib/auth";
import { getClient } from "@/lib/clients";

export type UnlockState = { error?: string };

export async function unlock(slug: string, _prev: UnlockState, formData: FormData): Promise<UnlockState> {
  const client = getClient(slug);
  if (!client) return { error: "Cliente não encontrado." };
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(client, password)) return { error: "Senha incorreta." };
  await grantAccess(client);
  refresh();
  return {};
}

export async function lock(slug: string): Promise<void> {
  const client = getClient(slug);
  if (!client) return;
  await revokeAccess(client);
  refresh();
}
