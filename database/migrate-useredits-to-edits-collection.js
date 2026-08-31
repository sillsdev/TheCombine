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

// Gather ids up front so the update inside the loop can't disturb the cursor, and so
// multi-MB documents are held in memory only one at a time. Sizes come from $bsonSize
// because mongosh has no Object.bsonsize and its bsonsize() global isn't in every version.
var idsToMigrate = [];
var sizeMbById = new Map();
userEdits.aggregate([
  { $match: oldFormat },
  { $project: { size: { $bsonSize: "$$ROOT" } } },
]).forEach(function (d) {
  idsToMigrate.push(d._id);
  sizeMbById.set(d._id.toHexString(), (d.size / (1024 * 1024)).toFixed(2));
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
    newDocs.length + " edit(s), was " + sizeMbById.get(userEditId) + " MB"
  );
});
print("Moved " + totalEditsMoved + " edit(s) from " + idsToMigrate.length + " document(s).");

// database/init/01-indexes.js creates this on every container start and documents the key;
// repeated here so a just-migrated database is indexed before its next restart.
edits.createIndex({ projectId: 1, userEditId: 1, guid: 1 });
print("Ensured index { projectId: 1, userEditId: 1, guid: 1 } on EditsCollection.");

// Verify: no old-format documents remain, and refs and edit documents correspond exactly.
var failures = 0;
function fail(message) {
  failures++;
  print("WARNING: " + message);
}

if (userEdits.countDocuments(oldFormat) > 0) {
  fail("old-format UserEdit documents remain.");
}

// Sets and Maps, not object literals: a userEditId of "constructor" (or any other
// Object.prototype key) would otherwise look like an id that had been seen.
var knownUserEditIds = new Set();
userEdits.find().forEach(function (doc) {
  var userEditId = doc._id.toHexString();
  knownUserEditIds.add(userEditId);

  if (!Array.isArray(doc.edits)) {
    fail("UserEdit " + userEditId + " has no `edits` array.");
    return;
  }

  // Exact ids, not counts: a dangling ref alongside an unreferenced edit, or a ref listed
  // twice, balances out in a count. AssembleUserEdit silently skips a dangling ref.
  var editsById = new Map();
  edits.find({ userEditId: userEditId }, { _id: 1, projectId: 1 }).forEach(function (e) {
    editsById.set(e._id.toHexString(), e);
  });

  var seen = new Set();
  doc.edits.forEach(function (ref, index) {
    var refId = String(ref);
    if (seen.has(refId)) {
      fail("UserEdit " + userEditId + " references " + refId + " more than once.");
      return;
    }
    seen.add(refId);

    var edit = editsById.get(refId);
    if (!edit) {
      fail(
        "UserEdit " + userEditId + " ref " + index + " (" + refId +
        ") has no EditsCollection document."
      );
      return;
    }
    // The backend filters on projectId too, so a mismatched child is invisible to it.
    if (edit.projectId !== doc.projectId) {
      fail(
        "EditsCollection " + refId + " has projectId " + edit.projectId +
        " but UserEdit " + userEditId + " has " + doc.projectId + "."
      );
    }
  });

  editsById.forEach(function (edit, editId) {
    if (!seen.has(editId)) {
      fail("EditsCollection " + editId + " is unreferenced by UserEdit " + userEditId + ".");
    }
  });
});

// A second pass, since the loop above only sees edits that have a parent. Keyed on parent
// id so unreferenced edits under a parent aren't reported twice.
edits.find({}, { _id: 1, userEditId: 1 }).forEach(function (e) {
  if (!knownUserEditIds.has(e.userEditId)) {
    fail(
      "EditsCollection " + e._id.toHexString() + " is orphaned: userEditId " +
      e.userEditId + " matches no UserEdit."
    );
  }
});

if (failures > 0) {
  // Throw, don't just print: mongosh otherwise exits 0 and a failed run looks like a pass.
  throw new Error("Verification FAILED with " + failures + " problem(s); see warnings.");
}
print(
  "Verification passed: " + userEdits.countDocuments({}) + " UserEdit document(s), " +
  edits.countDocuments({}) + " EditsCollection document(s), all refs resolve."
);
