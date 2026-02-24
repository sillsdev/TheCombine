// Migration script: convert MongoDB GUID fields from BinData subtype 3 (CSharpLegacy)
// to BinData subtype 4 (Standard/RFC 4122).
//
// Usage:
//   mongosh CombineDatabase migrate-guids-to-subtype4.js
//
// Background:
//   The C# MongoDB driver previously encoded System.Guid values using BinData subtype 3
//   with a CSharpLegacy byte order (little-endian for the first three components).
//   BinData subtype 4 uses a stable RFC 4122 byte order across all drivers, making
//   it easier to search by GUID in mongosh and other tools.
//
//   CSharpLegacy byte order for UUID aabbccdd-eeff-gghh-iijj-kkllmmnnoopp:
//     stored as [dd,cc,bb,aa, ff,ee, hh,gg, ii,jj,kk,ll,mm,nn,oo,pp]
//   Standard (subtype 4) byte order for the same UUID:
//     stored as [aa,bb,cc,dd, ee,ff, gg,hh, ii,jj,kk,ll,mm,nn,oo,pp]

/**
 * Convert a BinData subtype 3 (CSharpLegacy) GUID to BinData subtype 4 (Standard).
 * Returns null if the input is not a subtype-3 binary value.
 */
function csharpGuidToStandard(bin) {
  if (!(bin instanceof BinData) || bin.subtype() !== 3) {
    return null;
  }
  const hex = bin.hex();
  // Rearrange the first 8 bytes (4+2+2) from little-endian to big-endian;
  // the remaining 8 bytes are already in big-endian order.
  const reordered =
    hex[6] + hex[7] + hex[4] + hex[5] + hex[2] + hex[3] + hex[0] + hex[1] +
    hex[10] + hex[11] + hex[8] + hex[9] +
    hex[14] + hex[15] + hex[12] + hex[13] +
    hex.substring(16);
  const uuidStr =
    reordered.substring(0, 8) + "-" +
    reordered.substring(8, 12) + "-" +
    reordered.substring(12, 16) + "-" +
    reordered.substring(16, 20) + "-" +
    reordered.substring(20);
  return UUID(uuidStr);
}

let totalGuidsConverted = 0;
let totalDocumentsUpdated = 0;

// ── WordsCollection and FrontierCollection ──────────────────────────────────
//
// Each Word document has:
//   - guid           (BinData, top-level)
//   - senses[].guid  (BinData, per-element in the senses array)

for (const collName of ["WordsCollection", "FrontierCollection"]) {
  const coll = db.getCollection(collName);

  // Find all words that have binData guid fields (the conversion function handles subtype checking).
  coll.find({ guid: { $type: "binData" } }).forEach((doc) => {
    const update = {};

    // Convert top-level guid
    const newGuid = csharpGuidToStandard(doc.guid);
    if (newGuid !== null) {
      update["guid"] = newGuid;
      totalGuidsConverted++;
    }

    // Convert each sense's guid
    if (Array.isArray(doc.senses)) {
      doc.senses.forEach((sense, i) => {
        const newSenseGuid = csharpGuidToStandard(sense.guid);
        if (newSenseGuid !== null) {
          update[`senses.${i}.guid`] = newSenseGuid;
          totalGuidsConverted++;
        }
      });
    }

    if (Object.keys(update).length > 0) {
      coll.updateOne({ _id: doc._id }, { $set: update });
      totalDocumentsUpdated++;
    }
  });

  print(`${collName}: done`);
}

// ── UserEditsCollection ──────────────────────────────────────────────────────
//
// Each UserEdit document has:
//   - edits[].guid  (BinData, per-element in the edits array)

const userEditsColl = db.getCollection("UserEditsCollection");

// Find all UserEdits that have binData guid fields (the conversion function handles subtype checking).
userEditsColl.find({ "edits.guid": { $type: "binData" } }).forEach((doc) => {
  const update = {};

  if (Array.isArray(doc.edits)) {
    doc.edits.forEach((edit, i) => {
      const newEditGuid = csharpGuidToStandard(edit.guid);
      if (newEditGuid !== null) {
        update[`edits.${i}.guid`] = newEditGuid;
        totalGuidsConverted++;
      }
    });
  }

  if (Object.keys(update).length > 0) {
    userEditsColl.updateOne({ _id: doc._id }, { $set: update });
    totalDocumentsUpdated++;
  }
});

print("UserEditsCollection: done");
print(`Migration complete. ${totalGuidsConverted} GUID(s) converted in ${totalDocumentsUpdated} document(s).`);
