"use strict";

const { spawn, spawnSync } = require("child_process");
const { ensureDir } = require("fs-extra");

const dbPath = "./mongo_database";
const replSetName = "rs0";
const maxAttempts = 30;
const retryInterval = 1000; // ms

async function waitForMongo() {
  for (let i = 0; i < maxAttempts; i++) {
    const result = spawnSync("mongosh", [
      "--eval",
      "db.adminCommand('ping')",
      "--quiet",
    ]);
    if (result.status === 0) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }
  return false;
}

async function initReplicaSet() {
  const result = spawnSync(
    "mongosh",
    [
      "--eval",
      "try { rs.status() } catch(e) { rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] }) }",
      "--quiet",
    ],
    { stdio: "inherit" }
  );
  return result.status === 0;
}

async function waitForMongoToCloseThenExit(mongod) {
  const exitCode = await new Promise((resolve) =>
    mongod.on("close", (code) => resolve(code))
  );
  process.exit(exitCode ?? 1);
}

async function main() {
  await ensureDir(dbPath);

  const mongod = spawn(
    "mongod",
    [`--dbpath=${dbPath}`, "--replSet", replSetName],
    {
      stdio: "inherit",
    }
  );

  mongod.on("error", (err) => {
    console.error(`mongod error: ${err.message}`);
    process.exit(1);
  });

  process.on("SIGINT", () => {
    mongod.kill("SIGINT");
  });
  process.on("SIGTERM", () => {
    mongod.kill("SIGTERM");
  });

  const ready = await waitForMongo();
  if (!ready) {
    console.error("MongoDB did not start in time");
    mongod.kill("SIGTERM");
    await waitForMongoToCloseThenExit(mongod);
  }

  const initialized = await initReplicaSet();
  if (!initialized) {
    console.error("Replica set initialization failed");
    mongod.kill("SIGTERM");
    await waitForMongoToCloseThenExit(mongod);
  }

  await waitForMongoToCloseThenExit(mongod);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
