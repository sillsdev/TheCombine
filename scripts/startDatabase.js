"use strict";

const { spawn, spawnSync } = require("child_process");
const { emitKeypressEvents } = require("readline");

const { ensureDir } = require("fs-extra");

const dbPath = "./mongo_database";
const replSetName = "rs0";
const maxAttempts = 30;
const retryIntervalSeconds = 1;
const mongoshTimeoutSeconds = 10;
let mongodProcess;
let exiting = false;

function canUseRawMode() {
  return process.stdin.isTTY && typeof process.stdin.setRawMode === "function";
}

function stopRawMode() {
  if (canUseRawMode()) {
    process.stdin.setRawMode(false);
    process.stdin.pause();
  }
}

/** Enable raw mode to capture Ctrl+C when it doesn't otherwise work. */
function startRawMode() {
  if (canUseRawMode()) {
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("keypress", (_text, key) => {
      if (key?.ctrl && key.name === "c") {
        forceExit(130);
      }
    });
  }
}

function forceExit(code = 0) {
  if (exiting) {
    return;
  }

  exiting = true;

  stopRawMode();

  if (mongodProcess && !mongodProcess.killed) {
    mongodProcess.kill("SIGKILL");
  }
  process.exit(code);
}

function setUpInterruptHandling() {
  process.on("SIGINT", () => forceExit(130));
  process.on("SIGBREAK", () => forceExit(131));
  process.on("SIGTERM", () => forceExit(143));
  startRawMode();
}

function getErrorMessage(error) {
  return error instanceof Error
    ? `${error.code}: ${error.message}`
    : String(error);
}

function runMongosh(args, options = {}) {
  const result = spawnSync("mongosh", [...args, "--quiet"], {
    timeout: mongoshTimeoutSeconds * 1000,
    killSignal: "SIGTERM",
    ...options,
  });

  if (result.error) {
    throw result.error;
  }
  if (result.signal) {
    throw new Error(`mongosh exited due to signal ${result.signal}`);
  }

  return result;
}

async function waitForMongo() {
  for (let i = 0; i < maxAttempts; i++) {
    let result;
    try {
      result = runMongosh(["--eval", "db.adminCommand('ping')"]);
    } catch (error) {
      console.warn(`MongoDB ping failed: ${getErrorMessage(error)}`);
      return false;
    }

    if (result.status === 0) {
      return true;
    }

    await new Promise((res) => setTimeout(res, retryIntervalSeconds * 1000));
  }

  console.error(`MongoDB pings failed after ${maxAttempts} attempts`);
  return false;
}

async function initReplicaSet() {
  try {
    const result = runMongosh(
      [
        "--eval",
        "try { rs.status() } catch(e) { rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] }) }",
      ],
      { stdio: "inherit" }
    );
    return result.status === 0;
  } catch (error) {
    console.error(`Replica set init failed: ${getErrorMessage(error)}`);
    return false;
  }
}

async function main() {
  setUpInterruptHandling();

  await ensureDir(dbPath);

  mongodProcess = spawn(
    "mongod",
    [`--dbpath=${dbPath}`, "--replSet", replSetName],
    { stdio: "inherit" }
  );

  mongodProcess.on("error", (err) => {
    console.error(`mongod error: ${err.message}`);
    forceExit(1);
  });

  if (!(await waitForMongo())) {
    console.error("MongoDB did not start in time");
    forceExit(1);
  }
  if (!(await initReplicaSet())) {
    console.error("Replica set initialization failed");
    forceExit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
