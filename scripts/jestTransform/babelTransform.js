"use strict";

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
