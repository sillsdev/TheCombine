"use strict";

const path = require("path");

// This is a custom Jest transformer turning file imports into filenames.
// https://jestjs.io/docs/webpack

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));
    return `module.exports = ${assetFilename};`;
  },
};
