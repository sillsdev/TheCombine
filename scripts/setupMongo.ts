import * as makeDir from "make-dir";

const directory = "./mongo_database";

const makeMongoDirectory = async (): Promise<void> => {
  await makeDir(directory);
};

makeMongoDirectory().catch(console.error);
