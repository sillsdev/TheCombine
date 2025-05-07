"use strict";

// This is a custom Jest transformer turning file imports into filenames.
// https://parceljs.org/migration/cra/#6.-migrate-tests
// https://jestjs.io/docs/webpack#mocking-css-modules
// https://jest-archive-august-2023.netlify.app/docs/28.x/upgrading-to-jest28/#transformer

const basename = require("path").basename;

module.exports = {
  process(_src, filename) {
    return { code: `module.exports = ${JSON.stringify(basename(filename))};` };
  },
};
