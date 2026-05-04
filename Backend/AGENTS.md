# C# Code Style

- Refer to [`docs/style_guide/c_sharp_style_guide.md`](../docs/style_guide/c_sharp_style_guide.md) for C# conventions
- Key points include:
  - Follow Microsoft C# Coding Guidelines with project-specific exceptions
  - Use type inference (`var`) wherever possible
  - Add braces to one-line `if` statements
  - Prefer `Range` for simple loop iteration

---

# OpenAPI

## Backend Controllers

**When there are changes in `Backend/Controllers/` (or relevant changes in `Backend/Models/`),** you must regenerate the
OpenAPI specification.

### Prerequisites

1. Set up a Python virtual environment per the README instructions in [`README.md#python`](../README.md#python)

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

---

# Backend Dependencies

**After any backend dependency changes**, generate an updated license report from the repo root folder:

```bash
npm run license-report-backend
```

This command:

1. Runs `nuget-license` to analyze all backend dependencies (including transitive dependencies)
2. Outputs the results to intermediate file `docs/user_guide/assets/licenses/backend_licenses.json`
3. Runs a post-processing script to create formatted license documentation in
   `docs/user_guide/assets/licenses/backend_licenses.txt`
