[
  {
    // Match documents in the specified project that have senses with "en" or "tpi" gloss languages
    $match: {
      projectId: "654a790a79341a70ce2e6627",
      "senses.Glosses.Language": {
        $in: ["en", "tpi"],
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
    // Add a field to count the number of senses in each document
    $addFields: {
      senseCount: {
        $size: "$senses",
      },
    },
  },
  {
    // Filter documents to only those with exactly two senses
    $match: {
      senseCount: 2,
    },
  },
  {
    // Project necessary fields, and calculate size of glosses and extract first gloss language per sense
    $project: {
      senses: 1,
      originalDocument: 1,
      glossesPerSense: {
        $map: {
          input: "$senses",
          as: "sense",
          in: {
            $size: "$$sense.Glosses",
          },
        },
      },
      glossLangPerSense: {
        $map: {
          input: "$senses",
          as: "sense",
          in: {
            $arrayElemAt: [
              "$$sense.Glosses.Language",
              0,
            ],
          },
        },
      },
    },
  },
  {
    // Match to ensure each sense has exactly one gloss and the required languages are present
    $match: {
      glossesPerSense: [1, 1],
      glossLangPerSense: {
        $all: ["en", "tpi"],
      },
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
                    $arrayElemAt: [
                      "$$sense.Glosses.Language",
                      0,
                    ],
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
                    $arrayElemAt: [
                      "$$sense.Glosses.Language",
                      0,
                    ],
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
      toSemDomGuids:
        "$toSense.SemanticDomains.guid",
      fromSemDomGuids:
        "$fromSense.SemanticDomains.guid",
    },
  },
  {
    // Match documents where the semantic domains of 'to' sense are a subset of 'from' sense or 'to' sense has no semantic domains
    $match: {
      $expr: {
        $or: [
          {
            $setIsSubset: [
              "$toSemDomGuids",
              "$fromSemDomGuids",
            ],
          },
          {
            $eq: [
              {
                $size: "$toSemDomGuids",
              },
              0,
            ],
          },
        ],
      },
    },
  },
  {
    // Merge the senses into one by combining glosses
    $addFields: {
      mergedSenses: {
        $mergeObjects: [
          "$toSense",
          {
            Glosses: {
              $concatArrays: [
                "$toSense.Glosses",
                "$fromSense.Glosses",
              ],
            },
          },
        ],
      },
    },
  },
  {
    // Update the original document's senses with the merged senses
    $addFields: {
      "originalDocument.senses": [
        "$mergedSenses",
      ],
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
]