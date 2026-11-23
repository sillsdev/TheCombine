// Runs from the Kubernetes postStart hook on every container start (see
// deploy/helm/thecombine/charts/database/templates/database.yaml), after
// 00-replica-set.js has made this member PRIMARY.
//
// After a major-version image upgrade, mongod keeps the data's existing
// featureCompatibilityVersion (FCV), which disables the new release's features
// and blocks the next major upgrade. Raise FCV to match the running mongod.
//
// Once FCV is raised, the previous major version can no longer start on this
// data unless FCV is first lowered using the newer mongod.

const [major, minor] = db.version().split(".");
const serverVersion = `${major}.${minor}`;
const { featureCompatibilityVersion: fcv } = db.adminCommand({
  getParameter: 1,
  featureCompatibilityVersion: 1,
});

/** Compare "major.minor" version strings numerically. */
function compareVersions(a, b) {
  const [aMajor, aMinor] = a.split(".").map(Number);
  const [bMajor, bMinor] = b.split(".").map(Number);
  return aMajor - bMajor || aMinor - bMinor;
}

if (compareVersions(fcv.version, serverVersion) < 0) {
  print(
    `Raising featureCompatibilityVersion from ${fcv.version} to ${serverVersion}`
  );
  db.adminCommand({
    setFeatureCompatibilityVersion: serverVersion,
    confirm: true,
  });
}
print(`featureCompatibilityVersion is ${serverVersion}`);
