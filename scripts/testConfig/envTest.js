"use strict";

const fs = require("fs");
const path = require("path");

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/pull/648
const appDirectory = fs.realpathSync(process.cwd());
const dotenv = path.resolve(appDirectory, ".env");

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [`${dotenv}.test.local`, `${dotenv}.test`, dotenv];

// Load environment variables from .env* files, ignoring missing files.
// `dotenv` won't modify environment variables that are already set.
// Variable expansion is supported in .env files.
// https://github.com/motdotla/dotenv
// https://github.com/motdotla/dotenv-expand
dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    require("dotenv-expand")(
      require("dotenv").config({
        path: dotenvFile,
      })
    );
  }
});
