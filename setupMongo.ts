import * as makeDir from "make-dir";

const directory = "./mongo_database";

const makeMongoDirectory = async () => {
  await makeDir(directory);
};

makeMongoDirectory().catch(console.error);
