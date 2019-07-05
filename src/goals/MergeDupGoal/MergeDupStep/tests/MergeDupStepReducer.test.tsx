import { setWordData, moveSense } from "../MergeDupStepActions";
import { testWordList } from "../../../../types/word";
import mergeDupStepReducer from "../MergeDupStepReducer";
import { Hash, MergeTreeWord, MergeTreeReference } from "../MergeDupsTree";
import { randElement, uuid } from "../../../../utilities";

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
    let found = undefined;
    for (let wordID of Object.keys(words)) {
      for (let senseID of Object.keys(words[wordID].senses)) {
        for (let dupID of Object.keys(words[wordID].senses[senseID])) {
          if (words[wordID].senses[senseID][dupID] === id) {
            return {
              word: wordID,
              sense: senseID,
              duplicate: dupID
            };
          }
        }
      }
    }
    return undefined;
  };

  let getRandomRef = (words: Hash<MergeTreeWord>): MergeTreeReference => {
    let wordID = randElement(Object.keys(words));

    let senseID = randElement(Object.keys(words[wordID].senses));

    let dupID = randElement(Object.keys(words[wordID].senses[senseID]));
    return {
      word: wordID,
      sense: senseID,
      duplicate: dupID
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
        .length != 1
    ) {
      srcRef = getRandomRef(fullState.tree.words);
    }

    let destRef = { word: uuid(), sense: uuid(), duplicate: uuid() };
    let newState = mergeDupStepReducer(fullState, moveSense(srcRef, destRef));

    expect(getRef(srcRef, newState.tree.words)).toBe(undefined);
  });
});
