"use client";

import { useState } from "react";
import { Field } from "@/components/field";

// ASCII motion field behind the page header, edge to edge, fading out below it.
export function AsciiBackdrop() {
  const [supported, setSupported] = useState(true);
  if (!supported) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-8 -bottom-16 left-1/2 -z-10 w-screen -translate-x-1/2 overflow-hidden opacity-20 invert sm:-top-12 dark:invert-0 [mask-image:linear-gradient(to_bottom,black_65%,transparent)]"
    >
      <Field onUnsupported={() => setSupported(false)} />
    </div>
  );
}
