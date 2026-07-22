// Backfill script: populate SemanticDomainCountCollection from the current Frontier.
//
// The backend keeps a cached count, per (project, semantic domain), of how many Frontier
// sense-occurrences reference that domain. The count is maintained transactionally as words are
// created/updated/deleted, but existing projects need their counts computed once from the current
// Frontier. This script does that backfill.
//
// Usage (local):
//   mongosh CombineDatabase database/backfill-semantic-domain-counts.js
//
// Usage (Kubernetes, e.g. production):
//   kubectl -n thecombine cp database/backfill-semantic-domain-counts.js \
//     <database-pod>:/tmp/backfill-semantic-domain-counts.js
//   kubectl -n thecombine exec <database-pod> -- \
//     mongosh CombineDatabase /tmp/backfill-semantic-domain-counts.js
//
// IMPORTANT:
// - This is NOT a breaking schema change: an old backend simply ignores the new collection, and the
//   new backend maintains it going forward. It is safe to deploy the count-maintaining backend first.
// - Run the backfill with word editing paused (backend scaled down, or no active users), because a
//   Frontier write that lands between the aggregation and this run could be double-counted (the new
//   backend already incremented it) or a delete missed. Editing while stopped avoids drift.
// - The script is idempotent: it fully rebuilds the collection, which is a pure cache derived from
//   the Frontier. Re-run it any time the counts are suspected to have drifted, or after restoring a
//   backup taken before the count collection existed.
//
// Count document (must match ProjectSemanticDomainCount in Backend/Models/ProjectSemanticDomainCount.cs):
//   { _id: ObjectId, projectId: string, domainId: string, count: int }

var frontier = db.getCollection("FrontierCollection");
var counts = db.getCollection("SemanticDomainCountCollection");

// Rebuild from scratch: the collection is fully derived from the Frontier.
var removed = counts.deleteMany({}).deletedCount;
print("Cleared " + removed + " existing count document(s).");

// Tally every (sense, semantic domain) occurrence per project. A word with two senses in the same
// domain contributes 2, matching how the backend maintains the counts.
var aggregated = frontier
  .aggregate(
    [
      { $unwind: "$senses" },
      { $unwind: "$senses.SemanticDomains" },
      {
        $group: {
          _id: { projectId: "$projectId", domainId: "$senses.SemanticDomains.id" },
          count: { $sum: 1 },
        },
      },
    ],
    { allowDiskUse: true }
  )
  .toArray();

var docs = aggregated.map(function (g) {
  return {
    _id: new ObjectId(),
    projectId: g._id.projectId,
    domainId: g._id.domainId,
    count: g.count,
  };
});

if (docs.length > 0) {
  counts.insertMany(docs, { ordered: false });
}
print("Inserted " + docs.length + " count document(s).");

// Unique compound index matches the one the backend creates on start-up.
counts.createIndex({ projectId: 1, domainId: 1 }, { unique: true });
print("Ensured unique index { projectId: 1, domainId: 1 } on SemanticDomainCountCollection.");

// Verify: total counted occurrences equal the number of (sense, domain) pairs in the Frontier.
var expected = frontier
  .aggregate(
    [
      { $unwind: "$senses" },
      { $unwind: "$senses.SemanticDomains" },
      { $count: "n" },
    ],
    { allowDiskUse: true }
  )
  .toArray();
var expectedTotal = expected.length > 0 ? expected[0].n : 0;

var actualTotal = 0;
counts.find({}, { count: 1 }).forEach(function (d) {
  actualTotal += d.count;
});

if (actualTotal === expectedTotal) {
  print(
    "Verification passed: " + actualTotal + " occurrence(s) across " + docs.length + " (project, domain) pair(s)."
  );
} else {
  print("WARNING: counted " + actualTotal + " occurrence(s) but Frontier has " + expectedTotal + ".");
}
