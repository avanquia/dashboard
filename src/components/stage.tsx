"use client";

import { useCallback, useState } from "react";
import { Field } from "@/components/field";

export function Stage({ children }: { children: React.ReactNode }) {
  const [gl, setGl] = useState<"on" | "off">("on");
  const onUnsupported = useCallback(() => setGl("off"), []);

  return (
    <main
      data-gl={gl}
      className="stage relative isolate grid min-h-svh flex-1 place-items-center overflow-hidden bg-(--ink) px-5 py-12"
    >
      {gl === "on" && <Field onUnsupported={onUnsupported} />}
      {children}
    </main>
  );
}
