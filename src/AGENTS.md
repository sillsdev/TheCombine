# `src/api/`

**Important:** Do not manually edit the generated OpenAPI files in `src/api/`/

---

# TS/JS Code Style

- Refer to [`docs/style_guide/ts_style_guide.md`](docs/style_guide/ts_style_guide.md) for comprehensive TypeScript and
  JavaScript conventions
- Key points include:
  - Use `camelCase` for variables and functions
  - Use `PascalCase` for components, classes, and interfaces
  - Prefer `const` over `let`, avoid `var`
  - Use semicolons
  - Use double quotes for strings

---

# Frontend formatting

**After any frontend changes**, run the frontend formatter from the root repo folder:

```bash
npm run fmt-frontend
```

This command runs Prettier on all TypeScript, JavaScript, JSON, Markdown, and YAML files in the frontend directories
(`.github`, `.vscode`, `deploy`, `docs`, `maintenance`, `public`, `scripts`, `src`).

## Check formatting

**To check formatting without making changes:**

```bash
npm run fmt-frontend-check
```
