// Set the isAdmin flag to true on an existing database user.
//
// Usage: npm run set-admin-user -- myUserName
import { spawnSync } from "child_process";

const args = process.argv.slice(2);
if (args.length > 0) {
  const user = args[0];
  const updateCommand = `db.UsersCollection.updateOne({username: "${user}"}, {$set: {isAdmin: true}});`;

  const cmd = spawnSync("mongo", ["--eval", updateCommand, "CombineDatabase"]);
  console.log(`stderr: ${cmd.stderr.toString()}`);
  console.log(`stdout: ${cmd.stdout.toString()}`);
} else {
  console.log(
    "Must provide username as an argument, e.g. npm run set-admin-user -- myUserName"
  );
}
