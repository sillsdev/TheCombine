# Generating the API files for RTK Query

_(to be added to project README.md when merged with `master`)_

## Setup

1. Run `npm start` or `npm run backend`.
2. To browse the auto-generated OpenAPI UI, navigate to [http://localhost:5000/openapi](http://localhost:5000/openapi)
   in your web browser. _(optional)_

## Regenerate OpenAPI bindings for frontend

Run the following commands:

```bash
npx @rtk-query/codegen-openapi ./src/rtk-query/openapi-config.ts
npm run lint:fix-layout
```
