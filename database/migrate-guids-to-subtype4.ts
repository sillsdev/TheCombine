// Migration script: convert MongoDB GUID fields from BinData subtype 3 (CSharpLegacy)
// to BinData subtype 4 (Standard/RFC 4122).
//
// Usage:
//   npx tsc database/migrate-guids-to-subtype4.ts
//   mongosh CombineDatabase database/migrate-guids-to-subtype4.js
//
// Type-check only (no output):
//   npx tsc --project database/tsconfig.json --noEmit
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

// Type declarations for mongosh globals.
// All `declare` statements are erased by tsc and produce no JS output.
//
// The inline BsonBinary interface matches the bson@^7 Binary API:
//   sub_type is a number property; toString("hex") returns the hex string.
interface BsonBinary {
  sub_type: number;
  toString(encoding: "hex" | "base64" | "utf8" | "utf-8"): string;
}
declare function UUID(hexstr?: string): BsonBinary;
declare function print(msg: string): void;
declare const db: MongoDB;

type MongoDoc = Record<string, unknown>;

interface MongoCursor {
  forEach(callback: (doc: MongoDoc) => void): void;
}

interface MongoCollection {
  find(query: MongoDoc): MongoCursor;
  updateOne(filter: MongoDoc, update: MongoDoc): void;
}

interface MongoDB {
  getCollection(name: string): MongoCollection;
}

/**
 * Convert a BinData subtype 3 (CSharpLegacy) GUID to BinData subtype 4 (Standard).
 * Returns null if the input is not a subtype-3 binary value.
 */
function csharpGuidToStandard(bin: unknown): ReturnType<typeof UUID> | null {
  if (bin === null || typeof bin !== "object") {
    return null;
  }
  const binary = bin as Partial<BsonBinary>;
  if (binary.sub_type !== 3 || typeof binary.toString !== "function") {
    return null;
  }
  // Split the 32-character hex string into 16 byte pairs.
  const hexBytes = binary.toString("hex").match(/../g);
  if (hexBytes === null || hexBytes.length !== 16) {
    return null;
  }

  // Rearrange the first 8 bytes (4+2+2) from little-endian to big-endian;
  // the remaining 8 bytes are already in big-endian order.
  const uuidStr =
    hexBytes[3] + hexBytes[2] + hexBytes[1] + hexBytes[0] + "-" + // reverse 4 bytes
    hexBytes[5] + hexBytes[4] + "-" + // reverse 2 bytes
    hexBytes[7] + hexBytes[6] + "-" + // reverse 2 bytes
    hexBytes[8] + hexBytes[9] + "-" + // the rest stay the same
    hexBytes.slice(10).join("");
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
    const update: Record<string, ReturnType<typeof UUID>> = {};

    // Convert top-level guid.
    const newGuid = csharpGuidToStandard(doc["guid"]);
    if (newGuid !== null) {
      update["guid"] = newGuid;
      totalGuidsConverted++;
    }

    // Convert each sense's guid.
    if (Array.isArray(doc["senses"])) {
      (doc["senses"] as MongoDoc[]).forEach((sense, i) => {
        const newSenseGuid = csharpGuidToStandard(sense["guid"]);
        if (newSenseGuid !== null) {
          update[`senses.${i}.guid`] = newSenseGuid;
          totalGuidsConverted++;
        }
      });
    }

    if (Object.keys(update).length > 0) {
      coll.updateOne({ _id: doc["_id"] }, { $set: update });
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
  const update: Record<string, ReturnType<typeof UUID>> = {};

  if (Array.isArray(doc["edits"])) {
    (doc["edits"] as MongoDoc[]).forEach((edit, i) => {
      const newEditGuid = csharpGuidToStandard(edit["guid"]);
      if (newEditGuid !== null) {
        update[`edits.${i}.guid`] = newEditGuid;
        totalGuidsConverted++;
      }
    });
  }

  if (Object.keys(update).length > 0) {
    userEditsColl.updateOne({ _id: doc["_id"] }, { $set: update });
    totalDocumentsUpdated++;
  }
});

print("UserEditsCollection: done");

print(
  `Migration complete. ${totalGuidsConverted} GUID(s) converted in ${totalDocumentsUpdated} document(s).`
);

// ── Final verification scan ─────────────────────────────────────────────────
//
// Audit GUID fields for missing, empty, non-binary, or non-subtype-4 values.

interface GuidAuditCounts {
  totalGuidFieldsChecked: number;
  missing: number;
  empty: number;
  nonBinary: number;
  nonSubtype4: number;
}

function auditGuidField(value: unknown, counts: GuidAuditCounts): void {
  counts.totalGuidFieldsChecked++;

  if (value === null || value === undefined) {
    counts.missing++;
    return;
  }

  if (typeof value === "string" && value.trim() === "") {
    counts.empty++;
    return;
  }

  if (typeof value !== "object") {
    counts.nonBinary++;
    return;
  }

  const binary = value as {
    _bsontype?: unknown;
    sub_type?: unknown;
    toString?: (encoding: "hex") => string;
  };

  const looksBinary =
    binary._bsontype === "Binary" || typeof binary.sub_type === "number";

  if (!looksBinary || typeof binary.sub_type !== "number") {
    counts.nonBinary++;
    return;
  }

  if (binary.sub_type !== 4) {
    counts.nonSubtype4++;
    return;
  }

  if (typeof binary.toString === "function" && binary.toString("hex") === "") {
    counts.empty++;
  }
}

const guidAudit: GuidAuditCounts = {
  totalGuidFieldsChecked: 0,
  missing: 0,
  empty: 0,
  nonBinary: 0,
  nonSubtype4: 0,
};

for (const collName of ["WordsCollection", "FrontierCollection"]) {
  const coll = db.getCollection(collName);

  coll.find({}).forEach((doc) => {
    auditGuidField(doc["guid"], guidAudit);

    if (Array.isArray(doc["senses"])) {
      (doc["senses"] as MongoDoc[]).forEach((sense) => {
        auditGuidField(sense["guid"], guidAudit);
      });
    }
  });
}

userEditsColl.find({}).forEach((doc) => {
  if (Array.isArray(doc["edits"])) {
    (doc["edits"] as MongoDoc[]).forEach((edit) => {
      auditGuidField(edit["guid"], guidAudit);
    });
  }
});

const totalGuidIssues =
  guidAudit.missing +
  guidAudit.empty +
  guidAudit.nonBinary +
  guidAudit.nonSubtype4;

print(
  `Final scan: checked ${guidAudit.totalGuidFieldsChecked} GUID field(s); ` +
    `missing=${guidAudit.missing}, empty=${guidAudit.empty}, ` +
    `nonBinary=${guidAudit.nonBinary}, nonSubtype4=${guidAudit.nonSubtype4}.`
);

if (totalGuidIssues > 0) {
  throw new Error(
    `GUID audit failed: ${totalGuidIssues} issue(s) found across GUID fields.`
  );
}
