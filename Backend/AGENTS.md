# OpenAPI

## Backend Controllers

**When there are changes in [`Backend/Controllers/`](./Controllers/) (or relevant changes in
[`Backend/Models/`](./Models/)),** you must regenerate the OpenAPI specification.

### Prerequisites

1. Set up a Python virtual environment per the README instructions in [`README.md#python`](../README.md#python)

2. Start the backend server:

   ```bash
   npm run backend
   ```

### Generate OpenAPI Specification

With the backend running and the virtual environment activated, run from the repo root folder:

```bash
python ./scripts/generate_openapi.py
```

This script:

- Connects to the running backend
- Extracts the OpenAPI specification
- Generates TypeScript client bindings for the frontend
- Updates the API documentation

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
