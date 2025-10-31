// Create scripts files for frontend use

const folder = "./dist/scripts/";

// config.js: empty in dev

const ensureFile = require("fs-extra").ensureFile;

ensureFile(folder + "config.js");

// release.js: holds current version of The Combine

const spawnSync = require("child_process").spawnSync;

function runPy() {
  if (arguments.length > 0) {
    var args = Array.prototype.slice.call(arguments);
    let cmd;
    if (process.platform === "win32") {
      cmd = spawnSync("py", args);
    } else {
      cmd = spawnSync("python3", args);
    }
    return cmd.stdout.toString();
  }
}

runPy(
  "deploy/scripts/app_release.py",
  "--set-current",
  "--path",
  folder + "release.js"
);
