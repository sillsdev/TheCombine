// Runs from the Kubernetes postStart hook on every container start (see
// deploy/helm/thecombine/charts/database/templates/database.yaml), so keep
// every operation here idempotent.

const combineDb = db.getSiblingDB("CombineDatabase");

// The backend queries EditsCollection by projectId+userEditId (list all edits
// in a UserEdit) and by projectId+userEditId+guid (update a single edit).
combineDb.EditsCollection.createIndex({ projectId: 1, userEditId: 1, guid: 1 });
print(
  "Ensured index { projectId: 1, userEditId: 1, guid: 1 } on EditsCollection."
);
