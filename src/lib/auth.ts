import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Client } from "@/lib/types";

const cookieName = (slug: string) => `avq_${slug}`;

// The token is bound to the current password, so changing it logs everyone out.
function tokenFor(client: Client): string {
  return createHash("sha256").update(`${client.slug}:${client.password}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(client: Client, attempt: string): boolean {
  return safeEqual(client.password, attempt);
}

export async function isAuthorized(client: Client): Promise<boolean> {
  const value = (await cookies()).get(cookieName(client.slug))?.value;
  return !!value && safeEqual(tokenFor(client), value);
}

export async function grantAccess(client: Client): Promise<void> {
  (await cookies()).set(cookieName(client.slug), tokenFor(client), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/${client.slug}`,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function revokeAccess(client: Client): Promise<void> {
  (await cookies()).delete({ name: cookieName(client.slug), path: `/${client.slug}` });
}
