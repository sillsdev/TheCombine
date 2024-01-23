import { type MergeWords, Status, type Word } from "api/models";
import { defaultState } from "components/App/DefaultState";
import {
  defaultTree,
  type MergeData,
  type MergeTree,
  newMergeTreeSense,
  newMergeTreeWord,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { MergeDups } from "goals/MergeDuplicates/MergeDupsTypes";
import {
  deferMerge,
  dispatchMergeStepData,
  mergeAll,
  setData,
} from "goals/MergeDuplicates/Redux/MergeDupsActions";
import {
  defaultAudio,
  defaultState as defaultMergeState,
} from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { goalDataMock } from "goals/MergeDuplicates/Redux/tests/MergeDupsDataMock";
import { setupStore } from "store";
import { GoalType } from "types/goals";
import { multiSenseWord, newFlag } from "types/word";

const mockGraylistAdd = jest.fn();
const mockMergeWords = jest.fn();

jest.mock("backend", () => ({
  blacklistAdd: jest.fn(),
  getWord: jest.fn(),
  graylistAdd: () => mockGraylistAdd(),
  mergeWords: (mergeWordsArray: MergeWords[]) =>
    mockMergeWords(mergeWordsArray),
}));

const mockGoal = new MergeDups();
mockGoal.data = goalDataMock;
mockGoal.steps = [{ words: [] }, { words: [] }];

const preloadedState = {
  ...defaultState,
  goalsState: {
    allGoalTypes: [],
    currentGoal: new MergeDups(),
    goalTypeSuggestions: [],
    history: [mockGoal],
    previousGoalType: GoalType.Default,
  },
  mergeDuplicateGoal: {
    data: {} as MergeData,
    tree: {} as MergeTree,
    mergeWords: [],
  },
  _persist: { version: 1, rehydrated: false },
};

const vernA = "AAA";
const vernB = "BBB";
const idA = "WA";
const idB = "WB";
const wordA: Word = { ...multiSenseWord(vernA, ["S1", "S2"]), id: idA };
const wordB: Word = { ...multiSenseWord(vernB, ["S3", "S4"]), id: idB };
const senses = {
  S1: wordA.senses[0],
  S2: wordA.senses[1],
  S3: wordB.senses[0],
  S4: wordB.senses[1],
};
senses["S1"].accessibility = Status.Protected;
const S1 = senses["S1"].guid;
const S2 = senses["S2"].guid;
const S3 = senses["S3"].guid;
const S4 = senses["S4"].guid;
const data: MergeData = {
  senses: {
    [S1]: { ...newMergeTreeSense("S1", idA, 0), guid: S1, protected: true },
    [S2]: { ...newMergeTreeSense("S2", idA, 1), guid: S2 },
    [S3]: { ...newMergeTreeSense("S3", idB, 0), guid: S3 },
    [S4]: { ...newMergeTreeSense("S4", idB, 1), guid: S4 },
  },
  words: { WA: wordA, WB: wordB },
};

beforeEach(jest.clearAllMocks);

describe("MergeDupActions", () => {
  describe("mergeAll", () => {
    // Don't move or merge anything
    it("handles no merge", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1], ID2: [S2] });
      const WB = newMergeTreeWord(vernB, { ID1: [S3], ID2: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: {
          ...defaultMergeState,
          data,
          tree,
        },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).not.toHaveBeenCalled();
    });

    // Merge sense 3 from B as duplicate into sense 1 from A
    it("merges senses from different words", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1, S3], ID2: [S2] });
      const WB = newMergeTreeWord(vernB, { ID1: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: {
          ...defaultMergeState,
          data,
          tree,
        },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const mockMerges: MergeWords[] = mockMergeWords.mock.calls[0][0];
      expect(mockMerges).toHaveLength(2);

      const mergeWordA = mockMerges.find((m) => m.parent.id === idA)!;
      expect(mergeWordA.deleteOnly).toBeFalsy();
      const parentA = mergeWordA.parent;
      expect(parentA.vernacular).toEqual(vernA);
      expect(parentA.senses.map((s) => s.guid)).toEqual([S1, S2]);
      const childA = { srcWordId: idA, getAudio: true };
      const childAB = { srcWordId: idB, getAudio: false };
      expect(mergeWordA.children).toEqual([childA, childAB]);

      const mergeWordB = mockMerges.find((m) => m.parent.id === idB)!;
      expect(mergeWordB.deleteOnly).toBeFalsy();
      const parentB = mergeWordB.parent;
      expect(parentB.vernacular).toEqual(vernB);
      expect(parentB.senses.map((s) => s.guid)).toEqual([S4]);
      const childBB = { srcWordId: idB, getAudio: true };
      expect(mergeWordB.children).toEqual([childBB]);
    });

    // Move sense 3 from B to A
    it("moves sense between words", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1], ID2: [S2], ID3: [S3] });
      const WB = newMergeTreeWord(vernB, { ID1: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: {
          ...defaultMergeState,
          data,
          tree,
        },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const mockMerges: MergeWords[] = mockMergeWords.mock.calls[0][0];
      expect(mockMerges).toHaveLength(2);

      const mergeWordA = mockMerges.find((m) => m.parent.id === idA)!;
      expect(mergeWordA.deleteOnly).toBeFalsy();
      const parentA = mergeWordA.parent;
      expect(parentA.vernacular).toEqual(vernA);
      expect(parentA.senses.map((s) => s.guid)).toEqual([S1, S2, S3]);
      const childA = { srcWordId: idA, getAudio: true };
      const childAB = { srcWordId: idB, getAudio: false };
      expect(mergeWordA.children).toEqual([childA, childAB]);

      const mergeWordB = mockMerges.find((m) => m.parent.id === idB)!;
      expect(mergeWordB.deleteOnly).toBeFalsy();
      const parentB = mergeWordB.parent;
      expect(parentB.vernacular).toEqual(vernB);
      expect(parentB.senses.map((s) => s.guid)).toEqual([S4]);
      const childBB = { srcWordId: idB, getAudio: true };
      expect(mergeWordB.children).toEqual([childBB]);
    });

    // Merge sense 1 and 2 in A as duplicates
    it("merges senses within a word", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1, S2] });
      const WB = newMergeTreeWord(vernB, { ID1: [S3], ID2: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: {
          ...defaultMergeState,
          data,
          tree,
        },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const mockMerges: MergeWords[] = mockMergeWords.mock.calls[0][0];
      expect(mockMerges).toHaveLength(1);

      expect(mockMerges[0].deleteOnly).toBeFalsy();
      const parentA = mockMerges[0].parent;
      expect(parentA.id).toEqual(idA);
      expect(parentA.vernacular).toEqual(vernA);
      expect(parentA.senses.map((s) => s.guid)).toEqual([S1]);
      const childA = { srcWordId: idA, getAudio: true };
      expect(mockMerges[0].children).toEqual([childA]);
    });

    // Delete sense 2 from A
    it("delete one sense from word with multiple senses", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1] });
      const WB = newMergeTreeWord(vernB, { ID1: [S3], ID2: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: {
          ...defaultMergeState,
          data,
          tree,
          deleted: { senseGuids: [S2], words: [] },
        },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const mockMerges: MergeWords[] = mockMergeWords.mock.calls[0][0];
      expect(mockMerges).toHaveLength(1);

      expect(mockMerges[0].deleteOnly).toBeFalsy();
      const parentA = mockMerges[0].parent;
      expect(parentA.id).toEqual(idA);
      expect(parentA.vernacular).toEqual(vernA);
      expect(parentA.senses.map((s) => s.guid)).toEqual([S1]);
      const childA = { srcWordId: idA, getAudio: true };
      expect(mockMerges[0].children).toEqual([childA]);
    });

    // Delete both senses from B
    it("delete all senses from a word", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1], ID2: [S2] });
      const tree: MergeTree = { ...defaultTree, words: { WA } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: {
          ...defaultMergeState,
          data,
          tree,
          deleted: { senseGuids: [S3, S4], words: [wordB] },
        },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const mockMerges: MergeWords[] = mockMergeWords.mock.calls[0][0];
      expect(mockMerges).toHaveLength(1);

      expect(mockMerges[0].deleteOnly).toBeTruthy();
      expect(mockMerges[0].parent.id).toEqual(idB);
      const childB = { srcWordId: idB, getAudio: false };
      expect(mockMerges[0].children).toEqual([childB]);
    });

    // Move all senses from B to A
    it("move all senses to other words", async () => {
      const WA = newMergeTreeWord(vernA, {
        ID1: [S1, S3],
        ID2: [S4],
        ID3: [S2],
      });
      const tree: MergeTree = { ...defaultTree, words: { WA } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: {
          ...defaultMergeState,
          data,
          tree,
          audio: { ...defaultAudio, moves: { [idA]: [idB] } },
        },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const mockMerges: MergeWords[] = mockMergeWords.mock.calls[0][0];
      expect(mockMerges).toHaveLength(1);

      const parentA = mockMerges[0].parent;
      expect(parentA.id).toEqual(idA);
      expect(parentA.vernacular).toEqual(vernA);
      expect(parentA.senses.map((s) => s.guid)).toEqual([S1, S4, S2]);
      const childA = { srcWordId: idA, getAudio: true };
      const childB = { srcWordId: idB, getAudio: true };
      expect(mockMerges[0].children).toEqual([childA, childB]);
    });

    // Performs a merge when a word is flagged
    it("adds a flag to a word", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1], ID2: [S2] });
      WA.flag = newFlag("New flag");
      const WB = newMergeTreeWord(vernB, { ID1: [S3], ID2: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: {
          ...defaultMergeState,
          data,
          tree,
        },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const mockMerges: MergeWords[] = mockMergeWords.mock.calls[0][0];
      expect(mockMerges).toHaveLength(1);

      expect(mockMerges[0].deleteOnly).toBeFalsy();
      const parentA = mockMerges[0].parent;
      expect(parentA.id).toEqual(idA);
      expect(parentA.vernacular).toEqual(vernA);
      expect(parentA.flag).toEqual(WA.flag);
      expect(parentA.senses.map((s) => s.guid)).toEqual([S1, S2]);
      const childA = { srcWordId: idA, getAudio: true };
      expect(mockMerges[0].children).toEqual([childA]);
    });
  });

  describe("dispatchMergeStepData", () => {
    it("creates an action to add MergeDups data", () => {
      const goal = new MergeDups();
      goal.steps = [{ words: [...goalDataMock.plannedWords[0]] }];

      const store = setupStore();
      store.dispatch(dispatchMergeStepData(goal));
      const setDataAction = setData(goalDataMock.plannedWords[0]);
      expect(setDataAction.type).toEqual("mergeDupStepReducer/setDataAction");
    });
  });

  describe("deferMerge", () => {
    it("add merge to graylist", () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1], ID2: [S2] });
      WA.flag = newFlag("New flag");
      const WB = newMergeTreeWord(vernB, { ID1: [S3], ID2: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: {
          ...defaultMergeState,
          data,
          tree,
        },
      });
      store.dispatch(deferMerge());
      expect(mockGraylistAdd).toHaveBeenCalledTimes(1);
    });
  });
});
