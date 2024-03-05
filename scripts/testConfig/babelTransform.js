"use strict";

const babelJest = require("babel-jest").default;

module.exports = babelJest.createTransformer({
  presets: [
    require.resolve("@babel/preset-env"),
    [require.resolve("@babel/preset-react"), { runtime: "automatic" }],
    require.resolve("@babel/preset-typescript"),
  ],
  babelrc: false,
  configFile: false,
});
