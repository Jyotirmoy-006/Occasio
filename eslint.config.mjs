import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "complexity": ["error", { max: 25 }],
      "max-lines-per-function": [
        "error",
        {
          max: 440,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
