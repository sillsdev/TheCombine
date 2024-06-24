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
    // Identify and extract 'to' and 'from' senses for merging based on gloss languages
    $addFields: {
      toSense: {
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
      fromSense: {
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
    // Add fields to extract semantic domain GUIDs from both 'to' and 'from' senses
    $addFields: {
      toSemDomGuids: "$toSense.SemanticDomains.guid",
      fromSemDomGuids: "$fromSense.SemanticDomains.guid",
    },
  },
  {
    // Match documents where the semantic domains of 'to' sense are a subset of 'from' sense or vice-versa
    $match: {
      $expr: {
        $or: [
          {
            $setIsSubset: ["$toSemDomGuids", "$fromSemDomGuids"],
          },
          {
            $setIsSubset: ["$fromSemDomGuids", "$toSemDomGuids"],
          },
        ],
      },
    },
  },
  {
    // Update the original document's senses with a merge of the "to" and "from" senses
    // Note: The part of speech / grammatical category of the "from" sense is lost
    $addFields: {
      "originalDocument.senses": {
        $mergeObjects: [
          "$toSense",
          {
            Definitions: {
              $concatArrays: ["$toSense.Definitions", "$fromSense.Definitions"],
            },
            Glosses: {
              $concatArrays: ["$toSense.Glosses", "$fromSense.Glosses"],
            },
            SemanticDomains: {
              $cond: {
                if: {
                  $gte: [
                    { $size: "$toSemDomGuids" },
                    { $size: "$fromSemDomGuids" },
                  ],
                },
                then: "$toSense.SemanticDomains",
                else: "$fromSense.SemanticDomains",
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
    $merge: {
      into: "WordsCollection",
      on: "_id",
      whenMatched: "merge",
      whenNotMatched: "discard",
    },
  },
];
