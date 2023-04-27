import type { ConfigFile } from "@rtk-query/codegen-openapi";

const config: ConfigFile = {
  schemaFile: "http://localhost:5000/openapi/v1/openapi.json",
  apiFile: "./api/emptyApi.ts",
  apiImport: "emptySplitApi",
  outputFiles: {
    "./api/audio-api.ts": {
      filterEndpoints: [/audio/i],
    },
    "./api/avatar-api.ts": {
      filterEndpoints: [/avatar/i],
    },
    "./api/banner-api.ts": {
      filterEndpoints: [/banner/i],
    },
    "./api/invite-api.ts": {
      filterEndpoints: [/invite/i],
    },
    "./api/lift-api.ts": {
      filterEndpoints: [/lift/i],
    },
    "./api/merge-api.ts": {
      filterEndpoints: [/merge/i],
    },
    "./api/project-api.ts": {
      filterEndpoints: [/project/i],
    },
    "./api/semantic-domain-api.ts": {
      filterEndpoints: [/semantic-domain/i],
    },
    "./api/statistics-api.ts": {
      filterEndpoints: [/statistics/i],
    },
    "./api/user-api.ts": {
      filterEndpoints: [/user/i],
    },
    "./api/user-edit-api.ts": {
      filterEndpoints: [/user-edit/i],
    },
    "./api/user-role-api.ts": {
      filterEndpoints: [/user-role/i],
    },
    "./api/word-api.ts": {
      filterEndpoints: [/word/i],
    },
  },
  hooks: true,
};

export default config;
