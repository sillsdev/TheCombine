module.exports = {
  env: {
    browser: true,
    jest: true,
  },
  extends: [
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
  ],
  ignorePatterns: ["*.dic"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: { jsx: true },
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint", "react", "unused-imports"],
  root: true,
  rules: {
    "import/first": "warn",
    "import/newline-after-import": "warn",
    "import/no-duplicates": "warn",
    "import/no-named-as-default": "off",
    "import/no-named-as-default-member": "off",
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
    "no-undef": "off",
    "prefer-const": "warn",
    "react/jsx-boolean-value": "warn",
    "unused-imports/no-unused-imports": "warn",
  },
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      typescript: { alwaysTryTypes: true },
    },
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:import/typescript",
      ],
      rules: {
        "@typescript-eslint/explicit-function-return-type": [
          "warn",
          { allowExpressions: true },
        ],
        "@typescript-eslint/no-empty-interface": "warn",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/switch-exhaustiveness-check": "warn",
      },
    },
  ],
};
