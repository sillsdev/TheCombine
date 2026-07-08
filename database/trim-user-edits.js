// Migration script: trim oversized `edits` arrays in UserEditsCollection.
//
// Usage (local):
//   mongosh CombineDatabase database/trim-user-edits.js
//
// Usage (Kubernetes, e.g. production):
//   kubectl -n thecombine cp database/trim-user-edits.js <database-pod>:/tmp/trim-user-edits.js
//   kubectl -n thecombine exec <database-pod> -- mongosh CombineDatabase /tmp/trim-user-edits.js
//
// IMPORTANT: Back up the database first (e.g., maintenance/scripts/combine_backup.py,
// or at minimum `mongodump --db=CombineDatabase --collection=UserEditsCollection`).
// Trimming discards the oldest entries of each oversized `edits` array; they are
// unrecoverable without a backup.
//
// Background (https://github.com/sillsdev/TheCombine/issues/4320):
//   UserEdit documents grow with every goal a user works on. Documents that
//   approach MongoDB's 16 MB limit reject all further writes (WriteError 17419),
//   permanently blocking the user's goal/step progress in that project.
//   The backend now caps `edits` at the most recent MAX_EDITS entries on every
//   append; this script applies the same cap to existing documents. Documents are
//   trimmed in place — never deleted, since each user's `workedProjects` map
//   references the document `_id`.

// Keep in sync with UserEdit.MaxEdits in Backend/Models/UserEdit.cs.
var MAX_EDITS = 250;

var coll = db.getCollection("UserEditsCollection");
var overCap = {
  edits: { $exists: true, $type: "array" },
  $expr: { $gt: [{ $size: "$edits" }, MAX_EDITS] },
};

print("UserEdit documents with more than " + MAX_EDITS + " edits:");
var affected = 0;
coll.find(overCap).forEach(function (doc) {
  affected++;
  print(
    "  _id: " + doc._id.toString() + ", projectId: " + doc.projectId +
    ", edits: " + doc.edits.length + ", size: " +
    (Object.bsonsize(doc) / (1024 * 1024)).toFixed(2) + " MB"
  );
});
print("Total: " + affected);

if (affected > 0) {
  // $push with an empty $each and negative $slice atomically keeps the last
  // MAX_EDITS entries without rewriting the rest of the document.
  var result = coll.updateMany(overCap, {
    $push: { edits: { $each: [], $slice: -MAX_EDITS } },
  });
  print("Trimmed " + result.modifiedCount + " document(s) to the most recent " + MAX_EDITS + " edits.");
}

// Verify.
var remaining = coll.countDocuments(overCap);
if (remaining === 0) {
  print("Verification passed: no documents exceed " + MAX_EDITS + " edits.");
} else {
  print("WARNING: " + remaining + " document(s) still exceed " + MAX_EDITS + " edits.");
}
