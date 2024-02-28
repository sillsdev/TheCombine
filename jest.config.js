/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom", // default "node"
  coverageReporters: ["cobertura", "lcov", "text", "text-summary"],
  //roots: ["src"],
  modulePaths: ["<rootDir>", "src"],
};
