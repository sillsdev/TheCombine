// Ensure a single-node replica set is initialized and advertising the
// expected host for this environment.
//
// MONGO_INITDB_REPLICA_HOST can be set to the resolvable hostname:port
// used to advertise this member (e.g. "database:27017" in Kubernetes).
const host = process.env.MONGO_INITDB_REPLICA_HOST || "localhost:27017";
const maxWaitMs = 60000;
const intervalMs = 1000;
const start = Date.now();

function ensurePrimaryHost(forceReconfig) {
  let conf;
  try {
    conf = rs.conf();
  } catch (error) {
    if (!forceReconfig) {
      throw error;
    }

    conf = db.getSiblingDB("local").system.replset.findOne();
    if (!conf) {
      throw error;
    }
  }

  if (!conf.members || conf.members.length === 0) {
    throw new Error("Replica set config has no members");
  }

  if (conf.members[0].host === host) {
    return true;
  }

  if (conf.members[0].host !== host) {
    print(`Updating replica set member host to ${host}`);
    conf.members[0].host = host;
    conf.version = (conf.version || 1) + 1;
    if (forceReconfig) {
      rs.reconfig(conf, { force: true });
    } else {
      rs.reconfig(conf);
    }

    return false;
  }

  return true;
}

while (Date.now() - start < maxWaitMs) {
  try {
    const hello = db.hello();
    if (hello.isWritablePrimary) {
      try {
        const hostIsAligned = ensurePrimaryHost(false);
        if (hostIsAligned) {
          print("Replica set is PRIMARY with correct host");
          quit(0);
        }

        print("Replica set host updated, waiting for PRIMARY");
      } catch (error) {
        print(`Host alignment deferred (${error})`);
      }
    }
  } catch (error) {
    print(`Replica set not writable yet (${error})`);
  }

  try {
    const hostIsAligned = ensurePrimaryHost(true);
    if (!hostIsAligned) {
      print("Forced host alignment requested, waiting for PRIMARY");
    }
  } catch (error) {
    print(`Forced host alignment deferred (${error})`);
  }

  try {
    rs.initiate({ _id: "rs0", members: [{ _id: 0, host: host }] });
    print(`Initialized replica set with host ${host}`);
  } catch (error) {
    if (!String(error).includes("already initialized")) {
      print(`Replica set init deferred (${error})`);
    }
  }

  sleep(intervalMs);
}

throw new Error(
  `Replica set did not reach PRIMARY state with host ${host} after ${maxWaitMs}ms`
);
