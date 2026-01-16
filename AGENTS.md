# Agent Guidelines for The Combine

This document provides guidelines for AI coding agents working on The Combine codebase. Following these guidelines ensures consistency, quality, and compatibility with the project's development workflow.

## Table of Contents

1. [Commit Messages](#commit-messages)
2. [Code Style](#code-style)
3. [Formatting](#formatting)
4. [Dependency Management](#dependency-management)
5. [Backend Controllers](#backend-controllers)
6. [Localization](#localization)

---

## Commit Messages

All commit messages must satisfy the defaults of [gitlint](https://jorisroovers.com/gitlint/).

**Key requirements:**
- Minimum title length: 4 characters (as configured in `.gitlint`)
- Follow conventional commit message format
- Keep the title concise and descriptive
- Add detailed explanations in the commit body when necessary

**Example:**
```
Add user authentication endpoint

Implements JWT-based authentication for user login.
Includes validation and error handling.
```

---

## Code Style

Follow the project's established style guides:

### TypeScript/JavaScript
- Refer to [`docs/style_guide/ts_style_guide.md`](docs/style_guide/ts_style_guide.md) for comprehensive TypeScript and JavaScript conventions
- Key points include:
  - Use `camelCase` for variables and functions
  - Use `PascalCase` for components, classes, and interfaces
  - Prefer `const` over `let`, avoid `var`
  - Use semicolons
  - Use single quotes for strings

### C#
- Refer to [`docs/style_guide/c_sharp_style_guide.md`](docs/style_guide/c_sharp_style_guide.md) for C# conventions
- Key points include:
  - Follow Microsoft C# Coding Guidelines with project-specific exceptions
  - Use type inference (`var`) wherever possible
  - Add braces to one-line `if` statements
  - Prefer `Range` for simple loop iteration

---

## Formatting

### Backend Changes

**After any backend changes**, run the backend formatter:

```bash
npm run fmt-backend
```

This command runs `dotnet format` on both the main Backend project and Backend.Tests.

**To check formatting without making changes:**

```bash
npm run fmt-backend-check
```

### Frontend Changes

**After any frontend changes**, run the frontend formatter:

```bash
npm run fmt-frontend
```

This command runs Prettier on all TypeScript, JavaScript, JSON, Markdown, and YAML files in the frontend directories (`.github`, `.vscode`, `deploy`, `docs`, `maintenance`, `public`, `scripts`, `src`).

**To check formatting without making changes:**

```bash
npm run fmt-frontend-check
```

---

## Dependency Management

### Backend Dependencies

**After any backend dependency changes**, generate an updated license report:

```bash
npm run license-report-backend
```

This command:
1. Runs `nuget-license` to analyze all backend dependencies (including transitive dependencies)
2. Outputs the results to `docs/user_guide/assets/licenses/backend_licenses.json`
3. Runs a post-processing script to create formatted license documentation

### Frontend Dependencies

**After any frontend dependency changes**, generate an updated license report:

```bash
npm run license-report-frontend
```

This command:
1. Runs `license-checker-rseidelsohn` to analyze all frontend dependencies
2. Outputs the results to `docs/user_guide/assets/licenses/frontend_licenses.txt`

---

## Backend Controllers

**When there are changes in `Backend/Controllers/`**, you must regenerate the OpenAPI specification.

### Prerequisites

1. Set up a Python virtual environment per the README instructions (see the "Python" section under "Getting Started with Development"):

   ```bash
   # Create virtual environment (if not already created)
   python3 -m venv venv
   
   # Activate the virtual environment
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   
   # Install required packages
   python -m pip -q install pip==24.2 pip-tools==7.5.1
   python -m piptools sync -q dev-requirements.txt
   ```

2. Start the backend server:

   ```bash
   npm run backend
   ```

### Generate OpenAPI Specification

With the backend running and the virtual environment activated:

```bash
python ./scripts/generate_openapi.py
```

This script:
- Connects to the running backend
- Extracts the OpenAPI specification
- Generates TypeScript client bindings for the frontend
- Updates the API documentation

**Important:** Do not manually edit the generated OpenAPI files. Always regenerate them using this script.

---

## Localization

### Translation Files

**Do not translate any strings** added to `public/locales/en/translation.json`.

**Rationale:**
- Localization is handled externally through [Crowdin](https://crowdin.com/project/the-combine)
- Professional translators manage translations for all supported languages
- Manual translations in the codebase will be overwritten during the next Crowdin sync

**What to do:**
1. Add new English strings to `public/locales/en/translation.json`
2. Use appropriate translation keys in your code
3. Leave translation to other languages for the Crowdin platform

**Example:**

```json
{
  "myNewFeature": {
    "title": "My New Feature",
    "description": "This is a description of my new feature."
  }
}
```

```tsx
// In your React component
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t("myNewFeature.title")}</h1>;
}
```

---

## Summary Checklist

Before finalizing your changes, ensure you have:

- [ ] Written commit messages that satisfy gitlint requirements
- [ ] Followed the appropriate style guide (TypeScript or C#)
- [ ] Run `npm run fmt-backend` after backend changes
- [ ] Run `npm run fmt-frontend` after frontend changes
- [ ] Run `npm run license-report-backend` after backend dependency changes
- [ ] Run `npm run license-report-frontend` after frontend dependency changes
- [ ] Regenerated OpenAPI specification after `Backend/Controllers/` changes
- [ ] Added only English strings to translation files (no manual translations)
