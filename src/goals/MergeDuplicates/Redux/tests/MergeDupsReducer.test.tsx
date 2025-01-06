import {
  type Action,
  type PayloadAction,
  type UnknownAction,
} from "@reduxjs/toolkit";

import {
  type MergeTreeReference,
  type MergeTreeWord,
  convertSenseToMergeTreeSense,
  defaultSidebar,
  defaultTree,
  newMergeTreeWord,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import {
  clearTree,
  combineSense,
  deleteSense,
  flagWord,
  getMergeWords,
  moveSense,
  orderSense,
  setData,
} from "goals/MergeDuplicates/Redux/MergeDupsActions";
import mergeDupStepReducer from "goals/MergeDuplicates/Redux/MergeDupsReducer";
import {
  type MergeTreeState,
  defaultState,
} from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import {
  mergeTwoDefinitionsScenario,
  mergeTwoSensesScenario,
  mergeTwoWordsScenario,
} from "goals/MergeDuplicates/Redux/tests/MergeDupsDataMock";
import { type StoreAction, StoreActionTypes } from "rootRedux/actions";
import { setupStore } from "rootRedux/store";
import { type Hash } from "types/hash";
import { newFlag, testWordList } from "types/word";

jest.mock("uuid");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockUuid = require("uuid") as { v4: jest.Mock };

let uuidIndex = 0;
/** When `increment` (default `true`) is set to `false`,
 * returns the next uuid to be assigned by our mocked `v4`. */
function getMockUuid(increment = true): string {
  const uuid = `mockUuid${uuidIndex}`;
  if (increment) {
    uuidIndex++;
  }
  return uuid;
}

beforeEach(() => {
  mockUuid.v4.mockImplementation(getMockUuid);
});

describe("MergeDupsReducer", () => {
  // helper functions for working with a tree
  const getRefByGuid = (
    guid: string,
    words: Hash<MergeTreeWord>
  ): MergeTreeReference | undefined => {
    for (const wordId of Object.keys(words)) {
      for (const mergeSenseId of Object.keys(words[wordId].sensesGuids)) {
        const guids = words[wordId].sensesGuids[mergeSenseId];
        const order = guids.findIndex((g) => g === guid);
        if (order > -1) {
          return { wordId, mergeSenseId, order };
        }
      }
    }
    return undefined;
  };

  test("clearTree", () => {
    const store = setupStore();
    store.dispatch(setData(testWordList()));
    store.dispatch(clearTree());
    expect(JSON.stringify(store.getState().mergeDuplicateGoal)).toEqual(
      JSON.stringify(defaultState)
    );
  });

  function testTreeWords(): Hash<MergeTreeWord> {
    return {
      word1: newMergeTreeWord("senses:A0", {
        word1_senseA: ["word1_senseA_0"],
      }),
      word2: newMergeTreeWord("senses:A01", {
        word2_senseA: ["word2_senseA_0", "word2_senseA_1"],
      }),
      word3: newMergeTreeWord("senses:A0B012", {
        word3_senseA: ["word3_senseA_0"],
        word3_senseB: ["word3_senseB_0", "word3_senseB_1", "word3_senseB_2"],
      }),
    };
  }
  /** MergeTreeState with open sidebar */
  const mockState: MergeTreeState = {
    ...defaultState,
    tree: {
      ...defaultTree,
      sidebar: {
        ...defaultSidebar,
        mergeSenseId: "word2_senseA",
        wordId: "word2",
      },
      words: testTreeWords(),
    },
  };
  /** Check whether the action correctly updates the tree words.
   * Also, whether the sidebar was closed by the action (default: `false`).   */
  function checkTree(
    action: Action | PayloadAction,
    expectedWords: Hash<MergeTreeWord>,
    sidebarClosed = false
  ): void {
    const { sidebar, words } = mergeDupStepReducer(mockState, action).tree;
    expect(!sidebar.wordId).toEqual(sidebarClosed);
    // Stringify for this test, because order within `.sensesGuids` matters.
    expect(JSON.stringify(words)).toEqual(JSON.stringify(expectedWords));
  }

  describe("combineSense", () => {
    it("combine sense from 2-sense sidebar into other sense; closes sidebar", () => {
      const srcWordId = "word2";
      const srcSenseId = `${srcWordId}_senseA`;
      const srcRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: srcSenseId,
        order: 0,
      };

      const destWordId = "word1";
      const destSenseId = `${destWordId}_senseA`;
      const destRef: MergeTreeReference = {
        wordId: destWordId,
        mergeSenseId: destSenseId,
      };

      const testAction = combineSense({ src: srcRef, dest: destRef });

      const expectedWords = testTreeWords();
      // Sidebar sense _0 moved so _1 remains.
      expectedWords[srcWordId].sensesGuids[srcSenseId] = [`${srcSenseId}_1`];
      expectedWords[destWordId].sensesGuids[destSenseId] = [
        `${destSenseId}_0`,
        `${srcSenseId}_0`,
      ];

      checkTree(testAction, expectedWords, true);
    });

    it("combine sense from 3-sense sidebar into other sense", () => {
      const srcWordId = "word3";
      const srcSenseId = `${srcWordId}_senseB`;
      const srcRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: srcSenseId,
        order: 1,
      };

      const destWordId = "word1";
      const destSenseId = `${destWordId}_senseA`;
      const destRef: MergeTreeReference = {
        wordId: destWordId,
        mergeSenseId: destSenseId,
      };

      const testAction = combineSense({ src: srcRef, dest: destRef });

      const expectedWords = testTreeWords();
      // Sidebar sense _1 moved so _0, _2 remain.
      expectedWords[srcWordId].sensesGuids[srcSenseId] = [
        `${srcSenseId}_0`,
        `${srcSenseId}_2`,
      ];
      expectedWords[destWordId].sensesGuids[destSenseId] = [
        `${destSenseId}_0`,
        `${srcSenseId}_1`,
      ];

      checkTree(testAction, expectedWords);
    });

    it("combine sense into other sense in same word", () => {
      const wordId = "word3";
      const srcSenseId = `${wordId}_senseB`;
      const srcRef: MergeTreeReference = { wordId, mergeSenseId: srcSenseId };
      const destSenseId = `${wordId}_senseA`;
      const destRef: MergeTreeReference = { wordId, mergeSenseId: destSenseId };

      const testAction = combineSense({ src: srcRef, dest: destRef });

      const expectedWords = testTreeWords();
      // The word now has a single combined sense instead of two senses.
      expectedWords[wordId].sensesGuids = {
        [destSenseId]: [
          `${destSenseId}_0`,
          `${srcSenseId}_0`,
          `${srcSenseId}_1`,
          `${srcSenseId}_2`,
        ],
      };

      checkTree(testAction, expectedWords);
    });

    it("combine sense into other sense in other word", () => {
      const srcWordId = "word3";
      const srcSenseId = `${srcWordId}_senseA`;
      const srcRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: srcSenseId,
      };

      const destWordId = "word1";
      const destSenseId = `${destWordId}_senseA`;
      const destRef: MergeTreeReference = {
        wordId: destWordId,
        mergeSenseId: destSenseId,
      };

      const testAction = combineSense({ src: srcRef, dest: destRef });

      const expectedWords = testTreeWords();
      expectedWords[srcWordId].sensesGuids = {
        // _senseA moved so _senseB remains.
        word3_senseB: ["word3_senseB_0", "word3_senseB_1", "word3_senseB_2"],
      };
      expectedWords[destWordId].sensesGuids = {
        [destSenseId]: [`${destSenseId}_0`, `${srcSenseId}_0`],
      };

      checkTree(testAction, expectedWords);
    });

    it("combines last sense into other sense in other word", () => {
      const srcWordId = "word1";
      const srcSenseId = `${srcWordId}_senseA`;
      const srcRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId: srcSenseId,
      };

      const destWordId = "word3";
      const destSenseId = `${destWordId}_senseA`;
      const destRef: MergeTreeReference = {
        wordId: destWordId,
        mergeSenseId: destSenseId,
      };

      const testAction = combineSense({ src: srcRef, dest: destRef });

      const expectedWords = testTreeWords();
      delete expectedWords[srcWordId];
      expectedWords[destWordId].sensesGuids[destSenseId] = [
        `${destSenseId}_0`,
        `${srcSenseId}_0`,
      ];

      checkTree(testAction, expectedWords);
    });
  });

  describe("deleteSense", () => {
    it("deletes one-sense sense from a word with multiple senses", () => {
      const wordId = "word3";
      const mergeSenseId = `${wordId}_senseA`;
      const testRef: MergeTreeReference = { wordId, mergeSenseId };

      const testAction = deleteSense(testRef);

      const expectedWords = testTreeWords();
      delete expectedWords[wordId].sensesGuids[mergeSenseId];

      checkTree(testAction, expectedWords);
    });

    it("deletes multi-sense sense from a word with multiple senses", () => {
      const wordId = "word3";
      const mergeSenseId = `${wordId}_senseB`;
      const testRef: MergeTreeReference = { wordId, mergeSenseId };

      const testAction = deleteSense(testRef);

      const expectedWords = testTreeWords();
      delete expectedWords[wordId].sensesGuids[mergeSenseId];

      checkTree(testAction, expectedWords);
    });

    it("deletes word when deleting final sense", () => {
      const wordId = "word2";
      const testRef: MergeTreeReference = {
        wordId,
        mergeSenseId: `${wordId}_senseA`,
      };

      const testAction = deleteSense(testRef);

      const expectedWords = testTreeWords();
      delete expectedWords[wordId];

      // Also closes sidebar, since deleted sense was open in the sidebar.
      checkTree(testAction, expectedWords, true);
    });

    it("deletes sense from 2-sense sidebar; closes sidebar", () => {
      const wordId = "word2";
      const mergeSenseId = `${wordId}_senseA`;
      const testRef: MergeTreeReference = { wordId, mergeSenseId, order: 0 };

      const testAction = deleteSense(testRef);

      const expectedWords = testTreeWords();
      // Sidebar sense _0 removed so _1 remains.
      expectedWords[wordId].sensesGuids[mergeSenseId] = ["word2_senseA_1"];

      checkTree(testAction, expectedWords, true);
    });

    it("deletes sense from 3-sense sidebar", () => {
      const wordId = "word3";
      const mergeSenseId = `${wordId}_senseB`;
      const testRef: MergeTreeReference = { wordId, mergeSenseId, order: 2 };

      const testAction = deleteSense(testRef);

      const expectedWords = testTreeWords();
      // Sidebar sense _2 removed so _0, _1 remain.
      expectedWords[wordId].sensesGuids[mergeSenseId] = [
        `${mergeSenseId}_0`,
        `${mergeSenseId}_1`,
      ];

      checkTree(testAction, expectedWords);
    });
  });

  describe("flagWord", () => {
    it("adds a flag to a word", () => {
      const wordId = "word1";
      const testFlag = newFlag("flagged");
      const testAction = flagWord({ wordId: wordId, flag: testFlag });

      const expectedWords = testTreeWords();
      expectedWords[wordId].flag = testFlag;

      checkTree(testAction, expectedWords);
    });
  });

  describe("getMergeWords", () => {
    it("moves sense from one word to another", () => {
      const store = setupStore(mergeTwoWordsScenario.initialState());
      store.dispatch(getMergeWords());
      const mergeArray = store.getState().mergeDuplicateGoal.mergeWords;
      const expectedResult = mergeTwoWordsScenario.expectedResult;
      expect(mergeArray.length).toEqual(1);
      expect(mergeArray[0].parent.id).toEqual(expectedResult[0].parent);
      const senses = mergeArray[0].parent.senses.map((s) => s.guid).sort();
      expect(senses).toEqual(expectedResult[0].senses);
      const semDoms = mergeArray[0].parent.senses
        .flatMap((s) => s.semanticDomains.map((d) => d.id))
        .sort();
      expect(semDoms).toEqual(expectedResult[0].semDoms);
      const defs = mergeArray[0].parent.senses.map((s) => s.definitions);
      expect(defs).toEqual(expectedResult[0].defs);
    });

    it("combines sense from one word with sense in another", () => {
      const store = setupStore(mergeTwoSensesScenario.initialState());
      store.dispatch(getMergeWords());
      const mergeArray = store.getState().mergeDuplicateGoal.mergeWords;
      const expectedResult = mergeTwoSensesScenario.expectedResult;
      expect(mergeArray.length).toEqual(1);
      expect(mergeArray[0].parent.id).toEqual(expectedResult[0].parent);
      const senses = mergeArray[0].parent.senses.map((s) => s.guid).sort();
      expect(senses).toEqual(expectedResult[0].senses);
      const semDoms = mergeArray[0].parent.senses
        .flatMap((s) => s.semanticDomains.map((d) => d.id))
        .sort();
      expect(semDoms).toEqual(expectedResult[0].semDoms);
      const defs = mergeArray[0].parent.senses.map((s) => s.definitions);
      expect(defs).toEqual(expectedResult[0].defs);
    });

    it("combines senses with definitions", () => {
      const store = setupStore(mergeTwoDefinitionsScenario.initialState());
      store.dispatch(getMergeWords());
      const mergeArray = store.getState().mergeDuplicateGoal.mergeWords;
      const expectedResult = mergeTwoDefinitionsScenario.expectedResult;
      expect(mergeArray.length).toEqual(1);
      expect(mergeArray[0].parent.id).toEqual(expectedResult[0].parent);
      const senses = mergeArray[0].parent.senses.map((s) => s.guid).sort();
      expect(senses).toEqual(expectedResult[0].senses);
      const semDoms = mergeArray[0].parent.senses
        .flatMap((s) => s.semanticDomains.map((d) => d.id))
        .sort();
      expect(semDoms).toEqual(expectedResult[0].semDoms);
      const defs = mergeArray[0].parent.senses.map((s) => s.definitions);
      expect(defs).toEqual(expectedResult[0].defs);
    });
  });

  describe("moveSense", () => {
    it("moves sense from 2-sense sidebar to start of same word; closes sidebar", () => {
      const wordId = "word2";
      const mergeSenseId = `${wordId}_senseA`;
      const testRef: MergeTreeReference = { wordId, mergeSenseId, order: 0 };
      const srcGuid = `${mergeSenseId}_${testRef.order}`;

      // Intercept the uuid that will be assigned.
      const nextGuid = getMockUuid(false);
      const testAction = moveSense({
        src: testRef,
        destWordId: wordId,
        destOrder: 0,
      });

      const expectedWords = testTreeWords();
      expectedWords[wordId].sensesGuids = {
        // A new guid is used when a sense is added to a merge word, so use the intercepted
        // nextGuid for the new sense expected from moving a sense out of a sidebar.
        [nextGuid]: [srcGuid],
        // Sidebar sense _0 moved so _1 remains.
        [mergeSenseId]: ["word2_senseA_1"],
      };

      checkTree(testAction, expectedWords, true);
    });

    it("moves sense from 2-sense sidebar to end of other word; closes sidebar", () => {
      const srcWordId = "word2";
      const mergeSenseId = `${srcWordId}_senseA`;
      const testRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId,
        order: 1,
      };
      const srcGuid = `${mergeSenseId}_${testRef.order}`;

      const destWordId = "word3";

      // Intercept the uuid that will be assigned.
      const nextGuid = getMockUuid(false);
      const testAction = moveSense({ src: testRef, destWordId, destOrder: 2 });

      const expectedWords = testTreeWords();
      // Sidebar sense _1 moved so _0 remains.
      expectedWords[srcWordId].sensesGuids[mergeSenseId] = ["word2_senseA_0"];
      // A new guid is used when a sense is added to a merge word, so use the intercepted
      // nextGuid for the new sense expected from moving a sense out of a sidebar.
      expectedWords[destWordId].sensesGuids[nextGuid] = [srcGuid];

      checkTree(testAction, expectedWords, true);
    });

    it("moves sense from 3-sense sidebar to new word", () => {
      const srcWordId = "word3";
      const mergeSenseId = `${srcWordId}_senseB`;
      const testRef: MergeTreeReference = {
        wordId: srcWordId,
        mergeSenseId,
        order: 0,
      };
      const srcGuid = `${mergeSenseId}_${testRef.order}`;

      const destWordId = "new-word-id";

      // Intercept the uuid that will be assigned.
      const nextGuid = getMockUuid(false);
      const testAction = moveSense({ src: testRef, destWordId, destOrder: 0 });

      const expectedWords = testTreeWords();
      // Sidebar sense _0 moved so _1, _2 remain.
      expectedWords[srcWordId].sensesGuids[mergeSenseId] = [
        `${mergeSenseId}_1`,
        `${mergeSenseId}_2`,
      ];
      expectedWords[destWordId] = newMergeTreeWord();
      // A new guid is used when a sense is added to a merge word, so use the intercepted
      // nextGuid for the new sense expected from moving a sense out of a sidebar.
      expectedWords[destWordId].sensesGuids[nextGuid] = [srcGuid];

      checkTree(testAction, expectedWords);
    });

    it("moves sense to end of other word", () => {
      const srcWordId = "word3";
      const mergeSenseId = `${srcWordId}_senseB`;
      const testRef: MergeTreeReference = { wordId: srcWordId, mergeSenseId };

      const destWordId = "word1";

      const testAction = moveSense({ src: testRef, destWordId, destOrder: 1 });

      const expectedWords = testTreeWords();
      expectedWords[srcWordId].sensesGuids = {
        // _senseB moved so _senseA remains.
        word3_senseA: ["word3_senseA_0"],
      };
      expectedWords[destWordId].sensesGuids = {
        word1_senseA: ["word1_senseA_0"],
        [mergeSenseId]: ["word3_senseB_0", "word3_senseB_1", "word3_senseB_2"],
      };

      checkTree(testAction, expectedWords);
    });

    it("moves last sense to start of other word", () => {
      const srcWordId = "word1";
      const mergeSenseId = `${srcWordId}_senseA`;
      const testRef: MergeTreeReference = { wordId: srcWordId, mergeSenseId };

      const destWordId = "word2";

      const testAction = moveSense({ src: testRef, destWordId, destOrder: 0 });
      expect(testAction.type).toEqual("mergeDupStepReducer/moveSenseAction");

      const expectedWords = testTreeWords();
      delete expectedWords[srcWordId];
      expectedWords[destWordId].sensesGuids = {
        [mergeSenseId]: ["word1_senseA_0"],
        word2_senseA: ["word2_senseA_0", "word2_senseA_1"],
      };

      checkTree(testAction, expectedWords);
    });
  });

  describe("orderSense", () => {
    it("orders sidebar sense", () => {
      const wordId = "word2";
      const mergeSenseId = `${wordId}_senseA`;
      const testRef: MergeTreeReference = { wordId, mergeSenseId, order: 0 };

      const testAction = orderSense({ src: testRef, destOrder: 1 });

      const expectedWords = testTreeWords();
      expectedWords[wordId].sensesGuids[mergeSenseId] = [
        "word2_senseA_1",
        "word2_senseA_0",
      ];

      checkTree(testAction, expectedWords);
    });

    it("orders word sense", () => {
      const wordId = "word3";
      const mergeSenseId = `${wordId}_senseA`;
      const testRef: MergeTreeReference = { wordId, mergeSenseId };

      const testAction = orderSense({ src: testRef, destOrder: 1 });

      const expectedWords = testTreeWords();
      expectedWords[wordId].sensesGuids = {
        word3_senseB: ["word3_senseB_0", "word3_senseB_1", "word3_senseB_2"],
        word3_senseA: ["word3_senseA_0"],
      };

      checkTree(testAction, expectedWords);
    });
  });

  test("Reset returns default state", () => {
    const action: StoreAction = {
      type: StoreActionTypes.RESET,
    };

    expect(
      mergeDupStepReducer({} as MergeTreeState, action as UnknownAction)
    ).toEqual(defaultState);
  });

  test("setWordData", () => {
    const wordList = testWordList();
    const treeState = mergeDupStepReducer(undefined, setData(wordList));
    // check if data has all words present
    for (const word of wordList) {
      const srcWordId = word.id;
      expect(Object.keys(treeState.data.words)).toContain(srcWordId);
      // check each sense of word
      for (const [order, sense] of word.senses.entries()) {
        const treeSense = convertSenseToMergeTreeSense(sense, srcWordId, order);
        const senses = treeState.data.senses;
        expect(Object.values(senses).map((s) => JSON.stringify(s))).toContain(
          JSON.stringify(treeSense)
        );
        // check that this sense is somewhere in the tree
        expect(
          getRefByGuid(treeSense.sense.guid, treeState.tree.words)
        ).toBeDefined();
      }
    }
  });
});
