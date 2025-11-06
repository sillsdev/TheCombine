"use strict";

const { ensureDir } = require("fs-extra");

const directory = "./mongo_database";

ensureDir(directory);
