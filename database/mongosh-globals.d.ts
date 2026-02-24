// Type declarations for globals available in the mongosh shell.
// Uses types from the actual BSON library (bson npm package) so that the
// declared types are verified against the real runtime implementation.
//
// Kept in a separate .d.ts file so the runnable .ts script does not contain
// TypeScript-only `declare` syntax that causes mongosh to fail.

import { Binary } from "bson";

declare global {
  // mongosh exposes BinData as a constructor-like function whose .prototype
  // is Binary.prototype, so `x instanceof BinData` works for Binary values
  // returned from MongoDB queries.
  const BinData: {
    new (subtype: number, b64string: string): Binary;
    (subtype: number, b64string: string): Binary;
    readonly prototype: Binary;
  };

  function UUID(hexstr?: string): Binary;

  function print(msg: string): void;

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

  const db: MongoDB;
}
