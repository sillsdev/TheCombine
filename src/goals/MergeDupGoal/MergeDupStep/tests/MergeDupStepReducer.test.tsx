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
  const getRefByID = (
    id: string,
    words: Hash<MergeTreeWord>
  ): MergeTreeReference | undefined => {
    for (const wordId of Object.keys(words)) {
      for (const senseId of Object.keys(words[wordId].senses)) {
        for (const dupID of Object.keys(words[wordId].senses[senseId])) {
          if (words[wordId].senses[senseId][dupID] === id) {
            return {
              wordId: wordId,
              senseId: senseId,
              duplicate: dupID,
            };
          }
        }
      }
    }
    return undefined;
  };

  const getRandomRef = (words?: Hash<MergeTreeWord>): MergeTreeReference => {
    if (!words || Object.keys(words).length === 0) {
      return { wordId: uuid(), senseId: uuid(), duplicate: uuid() };
    }
    let wordId = "";
    let senseId = "";
    while (!wordId || !senseId || !words[wordId].senses[senseId]) {
      // This while loops make sure words with no senses aren't selected.
      wordId = randElement(Object.keys(words));
      senseId = randElement(Object.keys(words[wordId].senses));
    }
    const dupID = randElement(Object.keys(words[wordId].senses[senseId]));
    return {
      wordId: wordId,
      senseId: senseId,
      duplicate: dupID,
    };
  };

  const getRef = (
    ref: MergeTreeReference,
    words: Hash<MergeTreeWord>
  ): string | undefined => {
    if (words[ref.wordId]) {
      if (words[ref.wordId].senses[ref.senseId]) {
        return words[ref.wordId].senses[ref.senseId][ref.duplicate];
      }
    }
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
        expect(
          Object.values(data.data.senses).map((a) => JSON.stringify(a))
        ).toContain(JSON.stringify(treeSense));
        const ids = Object.keys(data.data.senses);
        const id_res = ids.find(
          (id) =>
            JSON.stringify(data.data.senses[id]) === JSON.stringify(treeSense)
        );
        expect(id_res).toBeTruthy();
        // check that this sense is somewhere in the tree
        expect(getRefByID(id_res ?? "", data.tree.words)).toBeTruthy();
      }
    }
  });

  test("move sense", () => {
    // move a random card to a new location and check that it is there
    const srcRef = getRandomRef(fullState.tree.words);
    const src =
      fullState.tree.words[srcRef.wordId].senses[srcRef.senseId][
        srcRef.duplicate
      ];
    const destRef = getRandomRef();
    const newState = mergeDupStepReducer(fullState, moveSense(srcRef, destRef));

    const finalRef = getRefByID(src, newState.tree.words);
    if (finalRef) {
      expect(finalRef.wordId).toEqual(destRef.wordId);
      expect(finalRef.senseId).toEqual(destRef.senseId);
      expect(finalRef.duplicate).toEqual(destRef.duplicate);
    } else {
      fail("destination should exist");
    }
  });

  test("Move sense deletes src", () => {
    let srcRef = getRandomRef(fullState.tree.words);
    while (
      Object.values(fullState.tree.words[srcRef.wordId].senses[srcRef.senseId])
        .length !== 1
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
