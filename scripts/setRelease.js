// Create the config.js file in ./public to specify
// the Runtime Configuration items.
//

const spawnSync = require("child_process").spawnSync;

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

runPy(
  "deploy/scripts/app_release.py",
  "--set-current",
  "--path",
  "./public/scripts/release.js"
);
