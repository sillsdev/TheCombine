import { spawnSync } from "child_process";

const cmd = spawnSync("mongo", [
  "-eval",
  "db.getSiblingDB('CombineDatabase').getCollection('ProjectsCollection').update({isActive: {$exists: false}}, {$set: {'isActive': true}}, {multi: true})",
]);
console.log(`stderr: ${cmd.stderr.toString()}`);
console.log(`stdout: ${cmd.stdout.toString()}`);
