import { spawnSync } from "child_process";

const cmd = spawnSync("mongo", [
  "-eval",
  "db.getSiblingDB('CombineDatabase').dropDatabase()",
]);
console.log(`stderr: ${cmd.stderr.toString()}`);
console.log(`stdout: ${cmd.stdout.toString()}`);
