// Make sure the needed files in ./public/scripts/ exist.

const ensureFile = require("fs-extra").ensureFile;

const folder = "./public/scripts/";

for (const file of ["config.js", "release.js"]) {
  ensureFile(folder + file);
}
