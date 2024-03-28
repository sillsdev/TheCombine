"use strict";

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "test";
process.env.NODE_ENV = "test";

// Make the script crash on unhandled rejections instead of silently ignoring them.
process.on("unhandledRejection", (err) => {
  throw err;
});

// Ensure environment variables are read.
require("./testConfig/envTest");

const jest = require("jest");

const argv = process.argv.slice(2);

// Watch unless on CI or explicitly running all tests
if (
  !process.env.CI &&
  argv.indexOf("--watchAll") === -1 &&
  argv.indexOf("--watchAll=false") === -1
) {
  argv.push("--watch");
}

jest.run(argv);
