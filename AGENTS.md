# Agent Guidelines for The Combine

This document provides guidelines for AI coding agents working on The Combine codebase. Following these guidelines
ensures consistency, quality, and compatibility with the project's development workflow.

---

## GitHub

Never commit or push directly to the `master` branch.

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

## Frontend Dependencies

Use `npm run i` (not `npm install`, nor `npm i`, nor `npm ci`) to install frontend dependencies.

### License Report

**After any frontend dependency changes**, generate an updated license report:

```bash
npm run license-report-frontend
```

This command:

1. Runs `license-checker-rseidelsohn` to analyze all frontend dependencies
2. Outputs the results to `docs/user_guide/assets/licenses/frontend_licenses.txt`

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
- [ ] Added only English to translation and user guide files (no manual translations)
