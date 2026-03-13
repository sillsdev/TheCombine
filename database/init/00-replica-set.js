// Ensure a single-node replica set is initialized and advertising the
// expected host for this environment.
//
// MONGO_INITDB_REPLICA_HOST can be set to the resolvable hostname:port
// used to advertise this member (e.g. "database:27017" in Kubernetes).
const host = process.env.MONGO_INITDB_REPLICA_HOST || "localhost:27017";
const maxWaitMs = 60 * 1000;
const intervalMs = 1000;
const start = Date.now();

/** Ensure the primary host is correctly configured */
function ensurePrimaryHost(forceReconfig) {
  let conf;
  try {
    conf = rs.conf();
  } catch (error) {
    conf = db.getSiblingDB("local").system.replset.findOne();
    if (!forceReconfig || !conf) {
      throw error;
    }
  }

  if (!conf.members?.length) {
    throw new Error("Replica set config has no members");
  }

  if (conf.members[0].host !== host) {
    print(`Updating replica set member host to ${host}`);
    conf.members[0].host = host;
    conf.version = (conf.version || 1) + 1;
    rs.reconfig(conf, { force: forceReconfig });
    return false;
  }

  return true;
}

// Wait for replica set to be initialized.
let replicaSetInitiated = false;
while (Date.now() - start < maxWaitMs) {
  try {
    rs.initiate({ _id: "rs0", members: [{ _id: 0, host: host }] });
    print(`Initialized replica set with host ${host}`);
    replicaSetInitiated = true;
    break;
  } catch (err) {
    if (String(err).includes("already initialized")) {
      print("Replica set already initialized");
      replicaSetInitiated = true;
      break;
    }

    print(`Replica set init deferred: ${err}`);
  }

  sleep(intervalMs);
}
if (!replicaSetInitiated) {
  throw new Error(`Replica set not initialized after ${maxWaitMs}ms`);
}

// Wait for this member to be PRIMARY with the correct host.
while (Date.now() - start < maxWaitMs) {
  try {
    if (db.hello().isWritablePrimary) {
      if (ensurePrimaryHost(false)) {
        print(`Replica set is PRIMARY with correct host: ${host}`);
        quit(0);
      }
    } else {
      ensurePrimaryHost(true);
    }
  } catch (err) {
    print(`Host alignment deferred: ${err}`);
  }

  sleep(intervalMs);
}
throw new Error(
  `Replica set did not reach PRIMARY state with host ${host} after ${maxWaitMs}ms`
);
