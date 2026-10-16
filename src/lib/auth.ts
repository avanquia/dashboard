import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Client } from "@/lib/types";

const cookieName = (slug: string) => `avq_${slug}`;

// The token is bound to the current password, so changing it logs everyone out.
function tokenFor(client: Client): string | null {
  const password = process.env[client.passwordEnv];
  const secret = process.env.SESSION_SECRET;
  if (!password || !secret) return null;
  return createHmac("sha256", secret).update(`${client.slug}:${password}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(client: Client, attempt: string): boolean {
  const password = process.env[client.passwordEnv];
  return !!password && safeEqual(password, attempt);
}

export async function isAuthorized(client: Client): Promise<boolean> {
  const token = tokenFor(client);
  const value = (await cookies()).get(cookieName(client.slug))?.value;
  return !!token && !!value && safeEqual(token, value);
}

export async function grantAccess(client: Client): Promise<void> {
  const token = tokenFor(client);
  if (!token) return;
  (await cookies()).set(cookieName(client.slug), token, {
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
