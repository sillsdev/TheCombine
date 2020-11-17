import { StoreAction, StoreActions } from "../../../../rootActions";
import { testWordList } from "../../../../types/word";
import { randElement, uuid } from "../../../../utilities";
import { clearTree, moveSense, setWordData } from "../MergeDupStepActions";
import {
  defaultState,
  mergeDupStepReducer,
  MergeTreeState,
} from "../MergeDupStepReducer";
import {
  defaultData,
  defaultTree,
  Hash,
  MergeTreeReference,
  MergeTreeWord,
} from "../MergeDupsTree";

// Actions to test
//
// SET_DATA
// CLEAR_TREE

describe("MergeDupStep reducer tests", () => {
  // state with data
  let fullState = mergeDupStepReducer(undefined, setWordData(testWordList()));

  // helper functions for working with a tree
  let getRefByID = (
    id: string,
    words: Hash<MergeTreeWord>
  ): MergeTreeReference | undefined => {
    for (let wordID of Object.keys(words)) {
      for (let senseID of Object.keys(words[wordID].senses)) {
        for (let dupID of Object.keys(words[wordID].senses[senseID])) {
          if (words[wordID].senses[senseID][dupID] === id) {
            return {
              word: wordID,
              sense: senseID,
              duplicate: dupID,
            };
          }
        }
      }
    }
    return undefined;
  };

  let getRandomRef = (words: Hash<MergeTreeWord>): MergeTreeReference => {
    let wordID: string = "";
    let senseID: string = "";
    while (!wordID || !senseID || !words[wordID].senses[senseID]) {
      // This while loops make sure words with no senses aren't selected.
      wordID = randElement(Object.keys(words));
      senseID = randElement(Object.keys(words[wordID].senses));
    }
    const dupID = randElement(Object.keys(words[wordID].senses[senseID]));
    return {
      word: wordID,
      sense: senseID,
      duplicate: dupID,
    };
  };

  let getRef = (
    ref: MergeTreeReference,
    words: Hash<MergeTreeWord>
  ): string | undefined => {
    if (words[ref.word]) {
      if (words[ref.word].senses[ref.sense]) {
        return words[ref.word].senses[ref.sense][ref.duplicate];
      }
    }
    return undefined;
  };

  test("clear data", () => {
    let newState = mergeDupStepReducer(fullState, clearTree());
    expect(JSON.stringify(newState)).toEqual(
      JSON.stringify({ tree: defaultTree, data: defaultData })
    );
  });

  test("set data", () => {
    const wordList = testWordList();
    let data = mergeDupStepReducer(undefined, setWordData(wordList));
    // check if data has all words present
    for (let word of wordList) {
      expect(Object.keys(data.data.words)).toContain(word.id);
      // check each sense of word
      for (let [index, sense] of word.senses.entries()) {
        let treeSense = { ...sense, srcWord: word.id, order: index };
        expect(
          Object.values(data.data.senses).map((a) => JSON.stringify(a))
        ).toContain(JSON.stringify(treeSense));
        let ids = Object.keys(data.data.senses);
        let id_res = ids.find(
          (id) =>
            JSON.stringify(data.data.senses[id]) === JSON.stringify(treeSense)
        );
        expect(id_res).toBeTruthy();
        let id = id_res ? id_res : "";
        // check that this sense is somewhere in the tree
        expect(getRefByID(id, data.tree.words)).toBeTruthy();
      }
    }
  });

  test("move sense", () => {
    // move a random card to a new location and check that it is there
    let srcRef = getRandomRef(fullState.tree.words);
    let src =
      fullState.tree.words[srcRef.word].senses[srcRef.sense][srcRef.duplicate];
    let destRef = { word: uuid(), sense: uuid(), duplicate: uuid() };
    let newState = mergeDupStepReducer(fullState, moveSense(srcRef, destRef));

    let finalRef = getRefByID(src, newState.tree.words);
    if (finalRef) {
      expect(finalRef.word).toEqual(destRef.word);
      expect(finalRef.sense).toEqual(destRef.sense);
      expect(finalRef.duplicate).toEqual(destRef.duplicate);
    } else {
      fail("destination should exist");
    }
  });

  test("Move sense deletes src", () => {
    let srcRef = getRandomRef(fullState.tree.words);
    while (
      Object.values(fullState.tree.words[srcRef.word].senses[srcRef.sense])
        .length !== 1
    ) {
      srcRef = getRandomRef(fullState.tree.words);
    }

    let destRef = { word: uuid(), sense: uuid(), duplicate: uuid() };
    let newState = mergeDupStepReducer(fullState, moveSense(srcRef, destRef));

    expect(getRef(srcRef, newState.tree.words)).toBe(undefined);
  });

  test("Reset returns default state", () => {
    let action: StoreAction = {
      type: StoreActions.RESET,
    };

    expect(mergeDupStepReducer({} as MergeTreeState, action)).toEqual(
      defaultState
    );
  });
});
