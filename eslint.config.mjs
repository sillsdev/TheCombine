import { defineConfig } from "eslint/config";
import pluginImport from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import pluginUnusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import typescriptEslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: ["**/api/**/*", "**/react-app-env.d.ts"],
  },
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.jest, ...globals.node },
      parser: typescriptEslint.parser,
      parserOptions: { project: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: {
      import: pluginImport,
      react: pluginReact,
      "unused-imports": pluginUnusedImports,
    },
    rules: {
      "import/first": "warn",
      "import/newline-after-import": "warn",
      "import/no-duplicates": "warn",
      "import/order": [
        "warn",
        {
          alphabetize: { order: "asc" },
          groups: [
            "builtin",
            "external",
            ["internal", "parent", "sibling", "index", "object", "type"],
          ],
          "newlines-between": "always",
        },
      ],
      "prefer-const": "warn",
      "react/jsx-boolean-value": "warn",
      "unused-imports/no-unused-imports": "warn",
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": { typescript: { alwaysTryTypes: true } },
    },
  },
  ...typescriptEslint.configs.strict.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        { allowExpressions: true },
      ],
      "@typescript-eslint/no-dynamic-delete": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
]);
