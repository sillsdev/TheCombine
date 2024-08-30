"use strict";

// File transformer to transform all .jsx/.ts/.tsx files into plain javascript for Jest.
// Modified from:
// https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/config/jest/babelTransform.js

const createTransformer = require("babel-jest").default.createTransformer;

module.exports = createTransformer({
  presets: [
    require.resolve("@babel/preset-env"),
    [require.resolve("@babel/preset-react"), { runtime: "automatic" }],
    require.resolve("@babel/preset-typescript"),
  ],
  babelrc: false,
  configFile: false,
});
