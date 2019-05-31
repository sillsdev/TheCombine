import * as makeDir from "make-dir";

let directory = "../mongo_database";

const makeMongoDirectory = async () => {
  const path = await makeDir(directory);
  console.log(path);
};

makeMongoDirectory();
