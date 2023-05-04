import type { ConfigFile } from "@rtk-query/codegen-openapi";

const config: ConfigFile = {
  schemaFile: "http://localhost:5000/openapi/v1/openapi.json",
  apiFile: "./api/emptyApi.ts",
  apiImport: "emptySplitApi",
  outputFiles: {
    "./api/audio-api.ts": {
      filterEndpoints: [/Audio/],
    },
    "./api/avatar-api.ts": {
      filterEndpoints: [/Avatar/],
    },
    "./api/banner-api.ts": {
      filterEndpoints: [/Banner/],
    },
    "./api/invite-api.ts": {
      filterEndpoints: [/Invite/, /Validate/i],
    },
    "./api/lift-api.ts": {
      filterEndpoints: [/Lift/],
    },
    "./api/merge-api.ts": {
      filterEndpoints: [/Merge/, /Blacklist/, /PotentialDuplicates/],
    },
    "./api/project-api.ts": {
      filterEndpoints: [
        /(?!Email).*Projects?.*(?!Words|UserRoles|UserEdits)/,
        "PutChars",
      ],
    },
    "./api/semanticdomain-api.ts": {
      filterEndpoints: [/SemanticDomain(Full|TreeNode)/],
    },
    "./api/statistics-api.ts": {
      filterEndpoints: [/Counts/, /LineChart/],
    },
    "./api/user-api.ts": {
      filterEndpoints: [
        /(?!Project)User/,
        /Password/,
        /Authenticate/,
        /CheckEmail/,
      ],
    },
    "./api/user-edit-api.ts": {
      filterEndpoints: [/UserEdit/],
    },
    "./api/user-role-api.ts": {
      filterEndpoints: [/UserRole/],
    },
    "./api/word-api.ts": {
      filterEndpoints: [
        /Word/,
        /Frontier/,
        /GetDuplicateId/,
        /UpdateDuplicate/,
      ],
    },
  },
  hooks: true,
};

export default config;
