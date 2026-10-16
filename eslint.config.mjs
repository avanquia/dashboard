import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored coss UI registry code (managed by `shadcn add`).
    "src/components/ui/**",
    "src/hooks/use-composer-editor.ts",
    "src/lib/composer-*.ts",
  ]),
]);

export default eslintConfig;
