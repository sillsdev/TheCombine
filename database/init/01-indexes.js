// The backend doesn't manage indexes itself, so this script is the only place a
// fresh install gets them; when a migration script creates an index, add it here
// too, so the index outlives that script's eventual removal.
//
// Runs from the Kubernetes postStart hook on every container start (see
// deploy/helm/thecombine/charts/database/templates/database.yaml), so keep every
// operation here idempotent.

const combineDb = db.getSiblingDB("CombineDatabase");

// The backend queries EditsCollection by projectId + userEditId (list a user edit's
// edits) and by projectId + userEditId + guid (replace/update a single edit).
combineDb.EditsCollection.createIndex({ projectId: 1, userEditId: 1, guid: 1 });
print("Ensured index { projectId: 1, userEditId: 1, guid: 1 } on EditsCollection.");
