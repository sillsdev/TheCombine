// Generate an HTML coverage report for the backend.
//
// Pre-requisites:
//  dotnet-reportgenerator-globaltool
//
//  $ dotnet tool install --global dotnet-reportgenerator-globaltool --version x.x.x
//
// Usage:
//  $ npm run coverage
//  $ npm run gen-backend-coverage-report
import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

const coverageInfoFile = path.join(".", "Backend.Tests", "coverage.info");
const coverageTargetDir = path.join(".", "coverage-backend");

if (fs.existsSync(coverageInfoFile)) {
  // Command:
  //  reportgenerator -reports:./Backend.Tests/coverage.info -targetdir:./coverage-backend
  const cmd = spawnSync("reportgenerator", [
    `-reports:${coverageInfoFile}`,
    `-targetdir:${coverageTargetDir}`,
  ]);

  if (cmd.stdout != null) {
    console.log(`stderr: ${cmd.stderr.toString()}`);
    console.log(`stdout: ${cmd.stdout.toString()}`);
  } else {
    console.log(
      "Unable to run reportgenerator executable.\n" +
        "Please follow the Backend Code Coverage Report README instructions " +
        "to install this."
    );
  }
} else {
  console.log(
    `${coverageInfoFile} does not exist. First run: npm run coverage.`
  );
}
