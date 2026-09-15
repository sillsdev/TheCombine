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
// - If a backend did write to unmigrated documents, those edits are kept rather than
//   dropped, and win over any stale embedded copy of the same goal; see the merge below.
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
userEdits
  .aggregate([
    { $match: oldFormat },
    { $project: { size: { $bsonSize: "$$ROOT" } } },
  ])
  .forEach(function (d) {
    idsToMigrate.push(d._id);
    sizeMbById.set(d._id.toHexString(), (d.size / (1024 * 1024)).toFixed(2));
  });
print("UserEdit documents to migrate: " + idsToMigrate.length);

var totalEditsMoved = 0;
var mergedDocs = [];
idsToMigrate.forEach(function (id) {
  var doc = userEdits.findOne({ _id: id });
  var userEditId = id.toHexString();

  // An ObjectId among the embedded edits was pushed by a backend writing to this document
  // while it was still unmigrated: UpdateUserEditGoal never reads the UserEdit, so
  // ReplaceEdit matches nothing and AddEdit $pushes a ref onto the embedded array with no
  // error. Those refs point at StoredEdits that are already in the target shape, so keep
  // them -- dropping them would discard a user's in-progress goal and leave their client
  // (which persists currentGoal) saving steps against an edit that no longer exists.
  var keptRefs = doc.edits.filter(function (e) {
    return e instanceof ObjectId;
  });

  // Validate kept refs before any write: duplicates, existence, and ownership must
  // be correct or this run should fail fast with no mutations for this document.
  var keptRefIds = keptRefs.map(function (ref) {
    return ref.toHexString();
  });
  var uniqueKeptRefIds = new Set(keptRefIds);
  if (uniqueKeptRefIds.size !== keptRefIds.length) {
    throw new Error(
      "UserEdit " +
        userEditId +
        " has duplicate kept ref(s); aborting before mutation."
    );
  }

  var keptById = new Map();
  if (keptRefs.length > 0) {
    edits
      .find(
        { _id: { $in: keptRefs } },
        { _id: 1, guid: 1, userEditId: 1, projectId: 1 }
      )
      .forEach(function (kept) {
        keptById.set(kept._id.toHexString(), kept);
      });
  }
  if (keptById.size !== uniqueKeptRefIds.size) {
    throw new Error(
      "UserEdit " +
        userEditId +
        " has kept ref(s) with no EditsCollection document; aborting before mutation."
    );
  }

  // A kept ref can share a guid with an embedded edit: advancing a step in an
  // already-started goal makes ReplaceEdit miss, so the pushed ref holds the newer state
  // of that same goal. The ref wins, and the stale embedded copy is skipped rather than
  // left as a duplicate guid for the backend's first-match reads to shadow.
  var supersededGuids = new Set();
  uniqueKeptRefIds.forEach(function (refId) {
    var kept = keptById.get(refId);
    if (kept.userEditId !== userEditId) {
      throw new Error(
        "UserEdit " +
          userEditId +
          " has kept ref " +
          refId +
          " with userEditId " +
          kept.userEditId +
          "; aborting before mutation."
      );
    }
    if (kept.projectId !== doc.projectId) {
      throw new Error(
        "UserEdit " +
          userEditId +
          " has kept ref " +
          refId +
          " with projectId " +
          kept.projectId +
          " (expected " +
          doc.projectId +
          "); aborting before mutation."
      );
    }
    supersededGuids.add(String(kept.guid));
  });

  // Clear any partial output from a previous interrupted run, sparing the kept refs:
  // every other EditsCollection row for this document is a leftover.
  edits.deleteMany({ userEditId: userEditId, _id: { $nin: keptRefs } });

  var refs = [];
  var newDocs = [];
  var superseded = 0;
  doc.edits.forEach(function (e) {
    if (e instanceof ObjectId) {
      refs.push(e);
      return;
    }
    if (supersededGuids.has(String(e.guid))) {
      superseded++;
      return;
    }
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
    newDocs.push(newDoc);
  });

  if (newDocs.length > 0) {
    edits.insertMany(newDocs, { ordered: true });
  }
  userEdits.updateOne({ _id: id }, { $set: { edits: refs } });

  totalEditsMoved += newDocs.length;
  print(
    "  migrated " +
      userEditId +
      " (projectId: " +
      doc.projectId +
      "): " +
      newDocs.length +
      " edit(s), was " +
      sizeMbById.get(userEditId) +
      " MB"
  );
  if (keptRefs.length > 0) {
    mergedDocs.push(userEditId);
    print(
      "    kept " +
        keptRefs.length +
        " edit(s) a backend had already written" +
        (superseded > 0
          ? ", superseding " + superseded + " stale embedded copy(ies)"
          : "")
    );
  }
});
print(
  "Moved " +
    totalEditsMoved +
    " edit(s) from " +
    idsToMigrate.length +
    " document(s)."
);

// The merge above keeps the data, but a mixed array is the one cheap signal that a backend
// was running against unmigrated documents, and this script cannot serialize against a live
// writer: a $push landing between the findOne and the $set above is overwritten (caught
// below as an unreferenced edit, but only after the fact). Say so loudly -- the run exits 0
// because the database really is correct, so this warning is the only thing the operator gets.
if (mergedDocs.length > 0) {
  print(
    "WARNING: " +
      mergedDocs.length +
      " document(s) already held edits written by a " +
      "backend, so a backend was up while the data was unmigrated: " +
      mergedDocs.join(", ") +
      ". Those edits were kept. Find out why it was running before trusting this run."
  );
}

// database/init/01-indexes.js creates this on every container start and documents the key;
// repeated here so a just-migrated database is indexed before its next restart.
edits.createIndex({ projectId: 1, userEditId: 1, guid: 1 });
print(
  "Ensured index { projectId: 1, userEditId: 1, guid: 1 } on EditsCollection."
);

// Verify: no old-format documents remain, and refs and edit documents correspond exactly.
// This intentionally overlaps with fail-fast kept-ref checks above: those protect a
// single document before writes, while this pass protects whole-run integrity,
// including pre-existing drift and races that can happen after a document is updated.
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
  edits
    .find({ userEditId: userEditId }, { _id: 1, projectId: 1 })
    .forEach(function (e) {
      editsById.set(e._id.toHexString(), e);
    });

  var seen = new Set();
  doc.edits.forEach(function (ref, index) {
    var refId = String(ref);
    if (seen.has(refId)) {
      fail(
        "UserEdit " + userEditId + " references " + refId + " more than once."
      );
      return;
    }
    seen.add(refId);

    var edit = editsById.get(refId);
    if (!edit) {
      fail(
        "UserEdit " +
          userEditId +
          " ref " +
          index +
          " (" +
          refId +
          ") has no EditsCollection document."
      );
      return;
    }
    // The backend filters on projectId too, so a mismatched child is invisible to it.
    if (edit.projectId !== doc.projectId) {
      fail(
        "EditsCollection " +
          refId +
          " has projectId " +
          edit.projectId +
          " but UserEdit " +
          userEditId +
          " has " +
          doc.projectId +
          "."
      );
    }
  });

  editsById.forEach(function (edit, editId) {
    if (!seen.has(editId)) {
      fail(
        "EditsCollection " +
          editId +
          " is unreferenced by UserEdit " +
          userEditId +
          "."
      );
    }
  });
});

// A second pass, since the loop above only sees edits that have a parent. Keyed on parent
// id so unreferenced edits under a parent aren't reported twice.
edits.find({}, { _id: 1, userEditId: 1 }).forEach(function (e) {
  if (!knownUserEditIds.has(e.userEditId)) {
    fail(
      "EditsCollection " +
        e._id.toHexString() +
        " is orphaned: userEditId " +
        e.userEditId +
        " matches no UserEdit."
    );
  }
});

if (failures > 0) {
  // Throw, don't just print: mongosh otherwise exits 0 and a failed run looks like a pass.
  throw new Error(
    "Verification FAILED with " + failures + " problem(s); see warnings."
  );
}
print(
  "Verification passed: " +
    userEdits.countDocuments({}) +
    " UserEdit document(s), " +
    edits.countDocuments({}) +
    " EditsCollection document(s), all refs resolve."
);
