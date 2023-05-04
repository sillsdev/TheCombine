import type { ConfigFile } from "@rtk-query/codegen-openapi";

const config: ConfigFile = {
  schemaFile: "http://localhost:5000/openapi/v1/openapi.json",
  apiFile: "./api/emptyApi.ts",
  apiImport: "emptySplitApi",
  outputFile: "./api/project-api.ts",
  exportName: "projectApi",
  filterEndpoints: [/Project/],
  hooks: true,
};

export default config;
