"use strict";

// This is a custom Jest transformer turning file imports into filenames.
// https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/config/jest/fileTransform.js
// https://jestjs.io/docs/webpack

const basename = require("path").basename;

module.exports = {
  process(_src, filename) {
    return `module.exports = ${JSON.stringify(basename(filename))};`;
  },
};
