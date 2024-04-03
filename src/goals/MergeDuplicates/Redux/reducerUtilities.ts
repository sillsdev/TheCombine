import {
  GramCatGroup,
  type MergeSourceWord,
  type MergeWords,
  Status,
  type Word,
} from "api/models";
import {
  type MergeData,
  type MergeTreeSense,
  type MergeTreeWord,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { newMergeWords } from "goals/MergeDuplicates/MergeDupsTypes";
import { type Hash } from "types/hash";
import { compareFlags } from "utilities/wordUtilities";

// A collection of helper/utility functions only for use in the MergeDupsReducer.

/** Create hash of senses keyed by id of src word. */
export function buildSenses(
  sensesGuids: Hash<string[]>,
  data: MergeData,
  deletedSenseGuids: string[]
): Hash<MergeTreeSense[]> {
  const senses: Hash<MergeTreeSense[]> = {};
  for (const senseGuids of Object.values(sensesGuids)) {
    for (const guid of senseGuids) {
      const senseData = data.senses[guid];
      const wordId = senseData.srcWordId;

      if (!senses[wordId]) {
        const dbWord = data.words[wordId];

        // Add each sense into senses as separate or deleted.
        senses[wordId] = [];
        for (const sense of dbWord.senses) {
          senses[wordId].push({
            order: senses[wordId].length,
            protected: sense.accessibility === Status.Protected,
            srcWordId: wordId,
            sense: {
              ...sense,
              accessibility: deletedSenseGuids.includes(sense.guid)
                ? Status.Deleted
                : Status.Separate,
            },
          });
        }
      }
    }
  }

  // Set sense and duplicate senses.
  Object.values(sensesGuids).forEach((guids) => {
    const sensesToCombine = guids
      .map((g) => data.senses[g])
      .map((s) => senses[s.srcWordId][s.order]);
    combineIntoFirstSense(sensesToCombine);
  });

  // Clean order of senses in each src word to reflect backend order.
  Object.values(senses).forEach((wordSenses) => {
    wordSenses = wordSenses.sort((a, b) => a.order - b.order);
    senses[wordSenses[0].srcWordId] = wordSenses;
  });

  return senses;
}

export function createMergeWords(
  wordId: string,
  mergeWord: MergeTreeWord,
  mergeSenses: Hash<MergeTreeSense[]>,
  word: Word
): MergeWords | undefined {
  // Don't return empty merges: when the only child is the parent word
  // and has the same number of senses as parent (all Active/Protected)
  // and has the same flag.
  if (Object.values(mergeSenses).length === 1) {
    const onlyChild = Object.values(mergeSenses)[0];
    if (
      onlyChild[0].srcWordId === wordId &&
      onlyChild.length === word.senses.length &&
      onlyChild.every((ms) =>
        [Status.Active, Status.Protected].includes(ms.sense.accessibility)
      ) &&
      compareFlags(mergeWord.flag, word.flag) === 0
    ) {
      return;
    }
  }

  // Construct parent and children.
  const parent: Word = {
    ...word,
    senses: [],
    flag: mergeWord.flag,
  };
  if (!parent.vernacular) {
    parent.vernacular = mergeWord.vern;
  }
  const children: MergeSourceWord[] = Object.values(mergeSenses).map(
    (msList) => {
      msList.forEach((mergeSense) => {
        if (
          [Status.Active, Status.Protected].includes(
            mergeSense.sense.accessibility
          )
        ) {
          parent.senses.push(mergeSense.sense);
        }
      });
      const getAudio = msList.every(
        (ms) => ms.sense.accessibility !== Status.Separate
      );
      return { srcWordId: msList[0].srcWordId, getAudio };
    }
  );

  return newMergeWords(parent, children);
}

/** Given an array of senses to combine:
 * - change the accessibility of the first one from Separate to Active/Protected,
 * - change the accessibility of the rest to Duplicate,
 * - merge select content from duplicates into main sense */
function combineIntoFirstSense(mergeSenses: MergeTreeSense[]): void {
  // Set the first sense to be merged as Active/Protected.
  // This was the top sense when the sidebar was opened.
  const mainSense = mergeSenses[0].sense;
  mainSense.accessibility = mergeSenses[0].protected
    ? Status.Protected
    : Status.Active;

  // Merge the rest as duplicates.
  // These were senses dropped into another sense.
  mergeSenses.slice(1).forEach((mergeDupSense) => {
    const dupSense = mergeDupSense.sense;
    dupSense.accessibility = Status.Duplicate;
    // Merge the duplicate's definitions into the main sense.
    const sep = "; ";
    dupSense.definitions.forEach((def) => {
      const newText = def.text.trim();
      if (newText) {
        // Check if definitions array already has entry with the same language.
        const oldDef = mainSense.definitions.find(
          (d) => d.language === def.language
        );
        if (!oldDef) {
          // If not, add this one to the array.
          mainSense.definitions.push({ ...def, text: newText });
        } else {
          // If so, check whether this one's text is already present.
          const oldText = oldDef.text.trim();
          if (!oldText) {
            oldDef.text = newText;
          } else if (!oldText.includes(newText)) {
            oldDef.text = `${oldText}${sep}${newText}`;
          }
        }
      }
    });

    // Use the duplicate's part of speech if not specified in the main sense.
    if (mainSense.grammaticalInfo.catGroup === GramCatGroup.Unspecified) {
      mainSense.grammaticalInfo = { ...dupSense.grammaticalInfo };
    }

    // Put the duplicate's domains in the main sense if the id is new.
    dupSense.semanticDomains.forEach((dom) => {
      if (mainSense.semanticDomains.every((d) => d.id !== dom.id)) {
        mainSense.semanticDomains.push({ ...dom });
      }
    });
  });
}
