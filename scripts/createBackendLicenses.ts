// To be run after generating a JSON license file with nuget-license

import { readFileSync, writeFileSync } from "fs";

const fileNameNoExt = "docs/user_guide/assets/licenses/backend_licenses";
const fileNameIn = `${fileNameNoExt}.json`;
const fileNameOut = `${fileNameNoExt}.txt`;

console.log(`Reading JSON data from ${fileNameIn}`);
const licenseData = JSON.parse(readFileSync(fileNameIn, "utf-8"));

// Ignore "LicenseInformationOrigin", "ValidationErrors"
const infoKeys = [
  "PackageId",
  "PackageVersion",
  "PackageProjectUrl",
  "Authors",
  "License",
  "LicenseUrl",
];

const sep = "###############################################################\n";
let licensesString = "";

for (const data of licenseData) {
  licensesString += sep;
  for (const key of infoKeys) {
    const datum = data[key];
    if (datum) {
      licensesString += `${key}: ${datum}\n`;
    }
  }
}

console.log(`Writing license data to ${fileNameOut}`);
writeFileSync(fileNameOut, licensesString);
