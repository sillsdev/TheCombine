// Create the config.js file in ./public to specify
// the Runtime Configuration items.
//

const spawnSync = require("child_process").spawnSync;
const { log } = require("console");

function quote_value() {
  if (arguments.length > 0) {
    const value = arguments[0];
    // is value a number?
    if (/^[+-]?[0-9]+([.][0-9]+)?$/.test(value)) {
      return `${value}`;
    }
    // is value already quoted?
    if (/^".*"$/.test(value)) {
      return `${value}`;
    }
    // is value a boolean?
    if (/^(true|false)?$/.test(value)) {
      return `${value}`;
    }
    return `"${value}"`;
  }
  return "";
}

function runPy() {
  if (arguments.length > 0) {
    var args = Array.prototype.slice.call(arguments);
    let cmd;
    if (process.plaform === "win32") {
      cmd = spawnSync("py", args);
    } else {
      cmd = spawnSync("python3", args);
    }
    return cmd.stdout.toString();
  }
}

// define our variables
const version = runPy("deploy/scripts/app_release.py", "--get").replace(
  /[\n\r]+$/,
  ""
);
runPy(
  "deploy/scripts/app_release.py",
  "--set",
  version,
  "--path",
  "./public/scripts/release.js"
);
