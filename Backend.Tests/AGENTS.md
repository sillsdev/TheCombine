# C# Code Style

- Refer to [`docs/style_guide/c_sharp_style_guide.md`](../docs/style_guide/c_sharp_style_guide.md) for C# conventions
- Key points include:
  - Follow Microsoft C# Coding Guidelines with project-specific exceptions
  - Use type inference (`var`) wherever possible
  - Add braces to one-line `if` statements
  - Prefer `Range` for simple loop iteration

---

# Backend Formatting

**After any backend changes,** run the backend formatter from the root repo directory:

```bash
npm run fmt-backend
```

This command runs `dotnet format` on both the main Backend project and Backend.Tests.

## Check Formatting

**To check formatting without making changes:**

```bash
npm run fmt-backend-check
```
