"use strict";

const fs = require("fs");
const path = require("path");

// Make sure any symlinks in the project folder are resolved.
// https://github.com/facebook/create-react-app/pull/648
const appDirectory = fs.realpathSync(process.cwd());
const dotenv = path.resolve(appDirectory, ".env");

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
