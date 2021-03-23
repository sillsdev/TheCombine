import {
  clearTree,
  moveSense,
  setWordData,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import {
  defaultState,
  mergeDupStepReducer,
  MergeTreeState,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupStepReducer";
import {
  Hash,
  MergeTreeReference,
  MergeTreeWord,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { StoreAction, StoreActions } from "rootActions";
import { testWordList } from "types/word";
import { randElement, uuid } from "utilities";

// Actions to test
//
// SET_DATA
// CLEAR_TREE

describe("MergeDupStep reducer tests", () => {
  // state with data
  const fullState = mergeDupStepReducer(undefined, setWordData(testWordList()));

  // helper functions for working with a tree
  const getRefByGuid = (
    guid: string,
    words: Hash<MergeTreeWord>
  ): MergeTreeReference | undefined => {
    for (const wordId of Object.keys(words)) {
      for (const mergeSenseId of Object.keys(words[wordId].sensesGuids)) {
        const senseGuids = words[wordId].sensesGuids[mergeSenseId];
        for (const duplicateId of Object.keys(senseGuids)) {
          if (senseGuids[duplicateId] === guid) {
            return { wordId, mergeSenseId, duplicateId };
          }
        }
      }
    }
    return undefined;
  };

  const getRandomRef = (words?: Hash<MergeTreeWord>): MergeTreeReference => {
    if (!words || Object.keys(words).length === 0) {
      return { wordId: uuid(), mergeSenseId: uuid(), duplicateId: uuid() };
    }

    let wordId = "";
    let mergeSenseId = "";
    while (
      !wordId ||
      !mergeSenseId ||
      !words[wordId].sensesGuids[mergeSenseId]
    ) {
      // This while loops make sure words with no senses aren't selected.
      wordId = randElement(Object.keys(words));
      mergeSenseId = randElement(Object.keys(words[wordId].sensesGuids));
    }
    const duplicateId = randElement(
      Object.keys(words[wordId].sensesGuids[mergeSenseId])
    );
    return { wordId, mergeSenseId, duplicateId };
  };

  const getRef = (
    ref: MergeTreeReference,
    words: Hash<MergeTreeWord>
  ): string | undefined => {
    if (words[ref.wordId]) {
      if (words[ref.wordId].sensesGuids[ref.mergeSenseId]) {
        return words[ref.wordId].sensesGuids[ref.mergeSenseId][ref.duplicateId];
      }
    }
    return undefined;
  };

  test("clear data", () => {
    const newState = mergeDupStepReducer(fullState, clearTree());
    expect(JSON.stringify(newState)).toEqual(JSON.stringify(defaultState));
  });

  test("set data", () => {
    const wordList = testWordList();
    const data = mergeDupStepReducer(undefined, setWordData(wordList));
    // check if data has all words present
    for (const word of wordList) {
      expect(Object.keys(data.data.words)).toContain(word.id);
      // check each sense of word
      for (const [index, sense] of word.senses.entries()) {
        const treeSense = { ...sense, srcWordId: word.id, order: index };
        const senses = data.data.senses;
        expect(Object.values(senses).map((s) => JSON.stringify(s))).toContain(
          JSON.stringify(treeSense)
        );
        const guids = Object.keys(senses);
        const guid = guids.find(
          (g) => JSON.stringify(senses[g]) === JSON.stringify(treeSense)
        );
        expect(guid).toBeTruthy();
        // check that this sense is somewhere in the tree
        expect(getRefByGuid(guid ?? "", data.tree.words)).toBeTruthy();
      }
    }
  });

  test("move sense", () => {
    // move a random card to a new location and check that it is there
    const words = fullState.tree.words;
    const srcRef = getRandomRef(words);
    const srcGuid =
      words[srcRef.wordId].sensesGuids[srcRef.mergeSenseId][srcRef.duplicateId];
    const destRef = getRandomRef();
    const newState = mergeDupStepReducer(fullState, moveSense(srcRef, destRef));

    const finalRef = getRefByGuid(srcGuid, newState.tree.words);
    if (finalRef) {
      expect(finalRef.wordId).toEqual(destRef.wordId);
      expect(finalRef.mergeSenseId).toEqual(destRef.mergeSenseId);
      expect(finalRef.duplicateId).toEqual(destRef.duplicateId);
    } else {
      fail("destination should exist");
    }
  });

  test("Move sense deletes src", () => {
    let srcRef = getRandomRef(fullState.tree.words);
    while (
      Object.values(
        fullState.tree.words[srcRef.wordId].sensesGuids[srcRef.mergeSenseId]
      ).length !== 1
    ) {
      srcRef = getRandomRef(fullState.tree.words);
    }

    const destRef = getRandomRef();
    let newState = mergeDupStepReducer(fullState, moveSense(srcRef, destRef));

    expect(getRef(srcRef, newState.tree.words)).toBe(undefined);
  });

  test("Reset returns default state", () => {
    const action: StoreAction = {
      type: StoreActions.RESET,
    };

    expect(mergeDupStepReducer({} as MergeTreeState, action)).toEqual(
      defaultState
    );
  });
});
