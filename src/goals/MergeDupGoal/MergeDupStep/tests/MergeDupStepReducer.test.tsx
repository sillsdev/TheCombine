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
  MergeTreeSense,
  MergeTreeWord,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { StoreAction, StoreActions } from "rootActions";
import { testWordList } from "types/word";
import { randElement, uuid } from "utilities";

describe("MergeDupStepReducer", () => {
  // state with data
  const fullState = mergeDupStepReducer(undefined, setWordData(testWordList()));

  // helper functions for working with a tree
  const getRefByGuid = (
    guid: string,
    words: Hash<MergeTreeWord>
  ): MergeTreeReference | undefined => {
    for (const wordId of Object.keys(words)) {
      for (const mergeSenseId of Object.keys(words[wordId].sensesGuids)) {
        const guids = words[wordId].sensesGuids[mergeSenseId];
        const order = guids.findIndex((g) => g === guid);
        if (order !== -1) {
          return { wordId, mergeSenseId, order };
        }
      }
    }
    return undefined;
  };

  // helper functions for working with a tree
  const getGuidByRef = (
    ref: MergeTreeReference,
    words: Hash<MergeTreeWord>
  ): string => {
    return words[ref.wordId].sensesGuids[ref.mergeSenseId][ref.order];
  };

  function getRandomRef(words?: Hash<MergeTreeWord>): MergeTreeReference {
    if (!words) {
      return { wordId: uuid(), mergeSenseId: uuid(), order: -1 };
    }

    let wordId = "";
    let mergeSenseId = "";
    while (
      !wordId ||
      !mergeSenseId ||
      !words[wordId].sensesGuids[mergeSenseId].length
    ) {
      // This while loops make sure words with no senses aren't selected.
      wordId = randElement(Object.keys(words));
      mergeSenseId = randElement(Object.keys(words[wordId].sensesGuids));
    }
    const order = randElement(
      words[wordId].sensesGuids[mergeSenseId].map((_guid, index) => index)
    );
    return { wordId, mergeSenseId, order };
  }

  test("clearTree", () => {
    const newState = mergeDupStepReducer(fullState, clearTree());
    expect(JSON.stringify(newState)).toEqual(JSON.stringify(defaultState));
  });

  test("setWordData", () => {
    const wordList = testWordList();
    const treeState = mergeDupStepReducer(undefined, setWordData(wordList));
    // check if data has all words present
    for (const word of wordList) {
      const srcWordId = word.id;
      expect(Object.keys(treeState.data.words)).toContain(srcWordId);
      // check each sense of word
      for (const [order, sense] of word.senses.entries()) {
        const treeSense: MergeTreeSense = { ...sense, srcWordId, order };
        const senses = treeState.data.senses;
        expect(Object.values(senses).map((s) => JSON.stringify(s))).toContain(
          JSON.stringify(treeSense)
        );
        // check that this sense is somewhere in the tree
        expect(
          getRefByGuid(treeSense.guid, treeState.tree.words)
        ).toBeDefined();
      }
    }
  });

  describe("moveSense", () => {
    it("moves a random sense to a new location", () => {
      const words = fullState.tree.words;
      const srcRef = getRandomRef(words);
      const guid = getGuidByRef(srcRef, words);
      const destRef = getRandomRef();
      const newState = mergeDupStepReducer(
        fullState,
        moveSense(srcRef, destRef)
      );

      const finalRef = getRefByGuid(guid, newState.tree.words);
      expect(finalRef).toBeDefined();
      if (finalRef) {
        expect(finalRef.wordId).toEqual(destRef.wordId);
        expect(finalRef.mergeSenseId).toEqual(destRef.mergeSenseId);
      }
    });

    it("deletes in src", () => {
      const words = fullState.tree.words;
      let srcRef = getRandomRef(words);
      while (
        fullState.tree.words[srcRef.wordId].sensesGuids[srcRef.mergeSenseId]
          .length !== 1
      ) {
        srcRef = getRandomRef(words);
      }
      const guid = getGuidByRef(srcRef, words);

      const destRef = getRandomRef();
      const newState = mergeDupStepReducer(
        fullState,
        moveSense(srcRef, destRef)
      );
      const srcGuids =
        newState.tree.words[srcRef.wordId].sensesGuids[srcRef.mergeSenseId];
      expect(srcGuids).not.toContainEqual(guid);
    });
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
