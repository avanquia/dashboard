"use client";

import { LogOutIcon } from "lucide-react";
import { useTransition } from "react";
import { lock } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function LockButton({ slug }: { slug: string }) {
  const [pending, start] = useTransition();
  return (
    <Button variant="ghost" size="sm" loading={pending} onClick={() => start(() => lock(slug))}>
      <LogOutIcon />
      Sair
    </Button>
  );
}
