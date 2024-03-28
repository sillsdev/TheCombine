"use strict";

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "test";
process.env.NODE_ENV = "test";

// Make the script crash on unhandled rejections instead of silently ignoring them.
process.on("unhandledRejection", (err) => {
  throw err;
});

const fs = require("fs");
const path = require("path");

// Make sure any symlinks in the project folder are resolved.
// https://github.com/facebook/create-react-app/pull/648
const dotenv = path.resolve(fs.realpathSync(process.cwd()), ".env");
// Load environment variables from .env files
// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
[`${dotenv}.test.local`, `${dotenv}.test`, dotenv].forEach((path) => {
  // Silently ignore missing files.
  if (fs.existsSync(path)) {
    // `dotenv` won't modify environment variables that are already set.
    // https://github.com/motdotla/dotenv
    // Variable expansion is supported in .env files.
    // https://github.com/motdotla/dotenv-expand
    require("dotenv-expand")(require("dotenv").config({ path }));
  }
});

const argv = process.argv.slice(2);

// Watch unless on CI or explicitly running all tests
if (
  !process.env.CI &&
  argv.indexOf("--watchAll") === -1 &&
  argv.indexOf("--watchAll=false") === -1
) {
  argv.push("--watch");
}

const jest = require("jest");

jest.run(argv);
