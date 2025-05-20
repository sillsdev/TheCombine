"use strict";

// File transformer to transform all .jsx/.ts/.tsx files into plain javascript for Jest.
// Not in a babel.config.js file since it's only used for Jest.
// Modified from:
// https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/config/jest/babelTransform.js
// https://parceljs.org/migration/cra/#6.-migrate-tests

const createTransformer = require("babel-jest").default.createTransformer;

module.exports = createTransformer({
  presets: [
    require.resolve("@babel/preset-env"),
    [require.resolve("@babel/preset-react"), { runtime: "automatic" }],
    require.resolve("@babel/preset-typescript"),
  ],
  plugins: [require.resolve("babel-plugin-transform-import-meta")],
  babelrc: false,
  configFile: false,
});
