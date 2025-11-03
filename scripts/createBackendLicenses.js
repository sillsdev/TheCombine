"use strict";
// To be run after generating a JSON license file with nuget-license
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var fileNameNoExt = "docs/user_guide/assets/licenses/backend_licenses";
var fileNameIn = "".concat(fileNameNoExt, ".json");
var fileNameOut = "".concat(fileNameNoExt, ".txt");
console.log("Reading JSON data from ".concat(fileNameIn));
var licenseData = JSON.parse((0, fs_1.readFileSync)(fileNameIn, "utf-8"));
// Ignore "LicenseInformationOrigin", "ValidationErrors"
var infoKeys = [
    "PackageId",
    "PackageVersion",
    "PackageProjectUrl",
    "Authors",
    "License",
    "LicenseUrl",
];
var sep = "###############################################################\n";
var licensesString = "";
for (var _i = 0, licenseData_1 = licenseData; _i < licenseData_1.length; _i++) {
    var data = licenseData_1[_i];
    licensesString += sep;
    for (var _a = 0, infoKeys_1 = infoKeys; _a < infoKeys_1.length; _a++) {
        var key = infoKeys_1[_a];
        var datum = data[key];
        if (datum) {
            licensesString += "".concat(key, ": ").concat(datum, "\n");
        }
    }
}
console.log("Writing license data to ".concat(fileNameOut));
(0, fs_1.writeFileSync)(fileNameOut, licensesString);
