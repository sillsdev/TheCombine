[
  {
    // Match documents in the specified project that have 2 senses, one with a lone "en"-language gloss and the other with a lone "tpi"-language gloss
    $match: {
      projectId: "654a790a79341a70ce2e6627",
      senses: { $size: 2 },
      "senses.0.Glosses": { $size: 1 },
      "senses.1.Glosses": { $size: 1 },
      "senses.Glosses.Language": {
        $all: ["en", "tpi"],
      },
    },
  },
  {
    // Preserve the original document for later stages to use
    $addFields: {
      originalDocument: "$$ROOT",
    },
  },
  {
    // Identify and extract two senses (A and B) for merging based on gloss languages
    $addFields: {
      senseA: {
        $arrayElemAt: [
          {
            $filter: {
              input: "$senses",
              as: "sense",
              cond: {
                $eq: [
                  {
                    $arrayElemAt: ["$$sense.Glosses.Language", 0],
                  },
                  "en",
                ],
              },
            },
          },
          0,
        ],
      },
      senseB: {
        $arrayElemAt: [
          {
            $filter: {
              input: "$senses",
              as: "sense",
              cond: {
                $eq: [
                  {
                    $arrayElemAt: ["$$sense.Glosses.Language", 0],
                  },
                  "tpi",
                ],
              },
            },
          },
          0,
        ],
      },
    },
  },
  {
    // Add fields to extract semantic domain GUIDs from both senses
    $addFields: {
      semDomGuidsA: "$senseA.SemanticDomains.guid",
      semDomGuidsB: "$senseB.SemanticDomains.guid",
    },
  },
  {
    // Match documents where the semantic domains of one sense are a subset of the other
    $match: {
      $expr: {
        $or: [
          {
            $setIsSubset: ["$semDomGuidsA", "$semDomGuidsB"],
          },
          {
            $setIsSubset: ["$semDomGuidsB", "$semDomGuidsA"],
          },
        ],
      },
    },
  },
  {
    // Update the original document's senses with a merge of the two senses
    // Note: The part of speech / grammatical category of the B sense is lost
    $addFields: {
      "originalDocument.senses": {
        $mergeObjects: [
          "$senseA",
          {
            Definitions: {
              $concatArrays: ["$senseA.Definitions", "$senseB.Definitions"],
            },
            Glosses: {
              $concatArrays: ["$senseA.Glosses", "$senseB.Glosses"],
            },
            protectReasons: {
              $concatArrays: [
                "$senseA.protectReasons",
                "$senseB.protectReasons",
              ],
            },
            SemanticDomains: {
              $cond: {
                if: {
                  $gte: [
                    { $size: "$semDomGuidsA" },
                    { $size: "$semDomGuidsB" },
                  ],
                },
                then: "$senseA.SemanticDomains",
                else: "$senseB.SemanticDomains",
              },
            },
          },
        ],
      },
    },
  },
  {
    // Replace the root of the document with the updated original document
    $replaceRoot: {
      newRoot: "$originalDocument",
    },
  },
  {
    // Merge the updated document back into the 'words' collection, updating where matched and discarding unmatched
    // Note: Need to run this again into the "FrontierCollection".
    $merge: {
      into: "WordsCollection",
      on: "_id",
      whenMatched: "merge",
      whenNotMatched: "discard",
    },
  },
];
