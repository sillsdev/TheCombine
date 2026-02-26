// Initialize the replica set on first startup.
// See: https://www.mongodb.com/docs/manual/tutorial/convert-standalone-to-replica-set/
//
// MONGO_INITDB_REPLICA_HOST can be set to the resolvable hostname:port
// used to advertise this member (e.g. the Kubernetes Service name "database:27017").
// It defaults to "localhost:27017" for local development.
try {
  rs.status();
} catch (e) {
  print(`Replica set not yet initialized (${e}), initializing now...`);
  const host = process.env.MONGO_INITDB_REPLICA_HOST || "localhost:27017";
  rs.initiate({ _id: "rs0", members: [{ _id: 0, host: host }] });
  // Wait for replica set to reach PRIMARY state before other init scripts run.
  const maxWaitMs = 30000;
  const intervalMs = 500;
  let waited = 0;
  let isPrimary = false;
  while (!isPrimary && waited < maxWaitMs) {
    sleep(intervalMs);
    waited += intervalMs;
    const status = rs.status();
    isPrimary =
      status.members !== undefined &&
      status.members.some((m) => m.stateStr === "PRIMARY");
  }
  if (!isPrimary) {
    throw new Error(
      `Replica set did not reach PRIMARY state after ${maxWaitMs}ms`
    );
  }
}
