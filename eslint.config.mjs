import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import nextPlugin from "@next/eslint-plugin-next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "next/core-web-vitals"
    ]
  }),
  {
    plugins: {
      "@next/next": nextPlugin
    },
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/exhaustive-deps": "off"
    }
  }
];

export default eslintConfig;