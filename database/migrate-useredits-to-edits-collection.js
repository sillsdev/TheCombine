// Migration script: move each embedded edit of UserEditsCollection into its own
// document in EditsCollection, leaving the UserEdit's `edits` array holding only
// ObjectId refs (in the original order).
//
// Usage (local):
//   mongosh CombineDatabase database/migrate-useredits-to-edits-collection.js
//
// Usage (Kubernetes, e.g. production):
//   kubectl -n thecombine cp database/migrate-useredits-to-edits-collection.js \
//     <database-pod>:/tmp/migrate-useredits-to-edits-collection.js
//   kubectl -n thecombine exec <database-pod> -- \
//     mongosh CombineDatabase /tmp/migrate-useredits-to-edits-collection.js
//
// IMPORTANT:
// - Back up the database first (e.g., maintenance/scripts/combine_backup.py, or at
//   minimum `mongodump --db=CombineDatabase --collection=UserEditsCollection`).
// - This is a BREAKING schema change: run it while the backend is stopped/scaled
//   down, then deploy the backend version that reads the new schema. Old backends
//   cannot read migrated documents, and the new backend cannot read unmigrated ones.
// - The script is idempotent: it only touches documents still in the old format,
//   and clears partial output from any interrupted previous run before redoing it.
// - If an old (pre-migration) backup is ever restored, rerun this script.
//
// Background (https://github.com/sillsdev/TheCombine/issues/4320):
//   UserEdit documents grow with every goal a user works on; documents approaching
//   MongoDB's 16 MB limit reject all further writes (WriteError 17419), permanently
//   blocking the user's goal/step progress in that project. With one document per
//   edit, no document grows meaningfully with use. UserEdit documents are modified
//   in place — never deleted or recreated, since each user's `workedProjects` map
//   references the document `_id`.

// New-format EditsCollection document (must match StoredEdit in Backend/Models/UserEdit.cs):
//   { _id: ObjectId, projectId: string, userEditId: string,
//     guid: UUID, goalType: int, stepData: [string], changes: string, modified: Date? }
// Migrated UserEditsCollection `edits` field (must match StoredUserEdit): [ObjectId, ...]

var userEdits = db.getCollection("UserEditsCollection");
var edits = db.getCollection("EditsCollection");

// Old-format documents have embedded edit objects (each with a `guid` field);
// migrated documents hold plain ObjectIds, which have no subfields.
var oldFormat = { "edits.0.guid": { $exists: true } };

// Gather ids up front so the update inside the loop can't disturb the cursor,
// and so multi-MB documents are held in memory only one at a time.
var idsToMigrate = userEdits.find(oldFormat, { _id: 1 }).toArray().map(function (d) {
  return d._id;
});
print("UserEdit documents to migrate: " + idsToMigrate.length);

var totalEditsMoved = 0;
idsToMigrate.forEach(function (id) {
  var doc = userEdits.findOne({ _id: id });
  var userEditId = id.toHexString();

  // Clear any partial output from a previous interrupted run: while the document
  // is still old-format, every EditsCollection row for it is a leftover.
  edits.deleteMany({ userEditId: userEditId });

  var refs = [];
  var newDocs = doc.edits.map(function (e) {
    var newDoc = {
      _id: new ObjectId(),
      projectId: doc.projectId,
      userEditId: userEditId,
      guid: e.guid,
      goalType: e.goalType,
      stepData: e.stepData,
      changes: e.changes,
    };
    if ("modified" in e) {
      newDoc.modified = e.modified;
    }
    refs.push(newDoc._id);
    return newDoc;
  });

  if (newDocs.length > 0) {
    edits.insertMany(newDocs, { ordered: true });
  }
  userEdits.updateOne({ _id: id }, { $set: { edits: refs } });

  totalEditsMoved += newDocs.length;
  print(
    "  migrated " + userEditId + " (projectId: " + doc.projectId + "): " +
    newDocs.length + " edit(s), was " +
    (Object.bsonsize(doc) / (1024 * 1024)).toFixed(2) + " MB"
  );
});
print("Moved " + totalEditsMoved + " edit(s) from " + idsToMigrate.length + " document(s).");

// All backend queries on EditsCollection filter by projectId (+ userEditId).
edits.createIndex({ projectId: 1, userEditId: 1 });
print("Ensured index { projectId: 1, userEditId: 1 } on EditsCollection.");

// Verify: no old-format documents remain, and every ref resolves.
var failures = 0;
if (userEdits.countDocuments(oldFormat) > 0) {
  failures++;
  print("WARNING: old-format UserEdit documents remain.");
}
userEdits.find().forEach(function (doc) {
  var refCount = doc.edits.length;
  var docCount = edits.countDocuments({ userEditId: doc._id.toHexString() });
  if (refCount !== docCount) {
    failures++;
    print(
      "WARNING: UserEdit " + doc._id.toHexString() + " has " + refCount +
      " ref(s) but " + docCount + " EditsCollection document(s)."
    );
  }
});
if (failures === 0) {
  print(
    "Verification passed: " + userEdits.countDocuments({}) + " UserEdit document(s), " +
    edits.countDocuments({}) + " EditsCollection document(s), all refs resolve."
  );
}
