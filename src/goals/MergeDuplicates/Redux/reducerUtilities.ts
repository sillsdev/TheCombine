import {
  GramCatGroup,
  type MergeSourceWord,
  type MergeWords,
  type Sense,
  Status,
  type Word,
} from "api/models";
import {
  type MergeTreeSense,
  type MergeTreeWord,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { newMergeWords } from "goals/MergeDuplicates/MergeDupsTypes";
import { type Hash } from "types/hash";
import { compareFlags } from "utilities/wordUtilities";

// A collection of helper/utility functions only for use in the MergeDupsReducer.

/** Generate dictionary of MergeTreeSense arrays:
 * - key: word id
 * - value: all merge senses of the word */
export function gatherWordSenses(
  words: Word[],
  deletedSenseGuids: string[]
): Hash<MergeTreeSense[]> {
  return Object.fromEntries(
    words.map((w) => [w.id, gatherSenses(w, deletedSenseGuids)])
  );
}

/** Generate MergeTreeSense array with deleted senses set to Status.Deleted. */
function gatherSenses(
  word: Word,
  deletedSenseGuids: string[]
): MergeTreeSense[] {
  return word.senses.map((sense, index) => ({
    order: index,
    protected: sense.accessibility === Status.Protected,
    srcWordId: word.id,
    sense: {
      ...sense,
      accessibility: deletedSenseGuids.includes(sense.guid)
        ? Status.Deleted
        : sense.accessibility,
    },
  }));
}

/** Create a MergeWords array for the words which had all senses deleted. */
export function getDeletedMergeWords(
  words: Word[],
  deletedSenseGuids: string[]
): MergeWords[] {
  return words
    .filter((w) => w.senses.every((s) => deletedSenseGuids.includes(s.guid)))
    .map((w) => newMergeWords(w, [{ srcWordId: w.id, getAudio: false }], true));
}

/** Determine if a merge is empty:
 * - no senses have been merged in as duplicates
 * - the sense guids all match
 * - the flag is unchanged */
export function isEmptyMerge(word: Word, mergeWord: MergeTreeWord): boolean {
  const mergeSensesGuids = Object.values(mergeWord.sensesGuids);
  const mergeGuids = mergeSensesGuids.map((guids) => guids[0]);
  const wordSenseGuids = word.senses.map((s) => s.guid);
  return (
    mergeSensesGuids.every((guids) => guids.length === 1) &&
    mergeGuids.length === wordSenseGuids.length &&
    wordSenseGuids.every((guid) => mergeGuids.includes(guid)) &&
    compareFlags(mergeWord.flag, word.flag) === 0
  );
}

/** Construct children of a MergeWord. */
export function createMergeChildren(
  mergeSenses: MergeTreeSense[][],
  audioMoves: string[] = []
): MergeSourceWord[] {
  const redundantIds = mergeSenses.flatMap((senses) =>
    senses.map((s) => s.srcWordId)
  );
  const childrenIds = [...new Set(redundantIds)];
  return childrenIds.map((srcWordId) => ({
    srcWordId,
    getAudio: audioMoves.includes(srcWordId),
  }));
}

/** Construct parent of a MergeWord. */
export function createMergeParent(
  word: Word,
  mergeWord: MergeTreeWord,
  allSenses: Sense[]
): Word {
  // Construct parent.
  const senses = Object.values(mergeWord.sensesGuids)
    .map((guids) => guids[0])
    .map((g) => allSenses.find((s) => s.guid === g)!);
  return {
    ...word,
    flag: mergeWord.flag,
    senses,
    vernacular: mergeWord.vern.trim() || word.vernacular.trim(),
  };
}

/** Given an array of senses to combine:
 * - identify the first/top sense as the main one to keep;
 * - change the accessibility of the rest to Status.Duplicate;
 * - merge select content from the rest into main sense */
export function combineIntoFirstSense(mergeSenses: MergeTreeSense[]): void {
  // Set the main sense to the first sense (the top one when the sidebar was opened).
  const mainSense = mergeSenses[0].sense;

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
