import { type MergeWords, type Sense, Status, type Word } from "api/models";
import { defaultState } from "components/App/DefaultState";
import {
  type MergeData,
  type MergeTree,
  defaultTree,
  newMergeTreeSense,
  newMergeTreeWord,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { MergeDups, newMergeWords } from "goals/MergeDuplicates/MergeDupsTypes";
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
import { multiSenseWord, newFlag, newWord } from "types/word";

// Used when the guids don't matter.
function wordAnyGuids(vern: string, senses: Sense[], id: string): Word {
  return {
    ...newWord(vern),
    senses: senses.map((s) => ({ ...s, guid: expect.any(String) })),
    id,
    guid: expect.any(String),
  };
}

const mockBlacklistAdd = jest.fn();
const mockGraylistAdd = jest.fn();
const mockMergeWords = jest.fn();

jest.mock("backend", () => ({
  blacklistAdd: (ids: string[]) => mockBlacklistAdd(ids),
  getWord: jest.fn(),
  graylistAdd: (ids: string[]) => mockGraylistAdd(ids),
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
  words: { WA: wordA, WB: wordB },
  senses: {
    [S1]: { ...newMergeTreeSense("S1", idA, 0, S1), protected: true },
    [S2]: newMergeTreeSense("S2", idA, 1, S2),
    [S3]: newMergeTreeSense("S3", idB, 0, S3),
    [S4]: newMergeTreeSense("S4", idB, 1, S4),
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockMergeWords.mockImplementation((mwArray: MergeWords[]) =>
    mwArray.filter((mw) => !mw.deleteOnly).map((mw) => mw.parent.id + "+")
  );
});

describe("MergeDupActions", () => {
  describe("mergeAll", () => {
    // Don't move or merge anything
    it("handles no merge", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1], ID2: [S2] });
      const WB = newMergeTreeWord(vernB, { ID1: [S3], ID2: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: { ...defaultMergeState, data, tree },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).not.toHaveBeenCalled();

      expect(mockBlacklistAdd).toHaveBeenCalledTimes(1);
      const blacklist = mockBlacklistAdd.mock.calls[0][0];
      expect(blacklist).toHaveLength(2);
      expect(blacklist).toContain(idA);
      expect(blacklist).toContain(idB);
    });

    // Merge sense 3 from B as duplicate into sense 1 from A
    it("merges senses from different words", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1, S3], ID2: [S2] });
      const WB = newMergeTreeWord(vernB, { ID1: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: { ...defaultMergeState, data, tree },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const parentA = wordAnyGuids(vernA, [senses["S1"], senses["S2"]], idA);
      const parentB = wordAnyGuids(vernB, [senses["S4"]], idB);
      const childA = { srcWordId: idA, getAudio: true };
      const childAB = { srcWordId: idB, getAudio: false };
      const childBB = { srcWordId: idB, getAudio: true };
      const mockMerges = [
        newMergeWords(parentA, [childA, childAB]),
        newMergeWords(parentB, [childBB]),
      ];
      for (const mergeWords of mockMerges) {
        expect(mockMergeWords.mock.calls[0][0]).toContainEqual(mergeWords);
      }

      expect(mockBlacklistAdd).toHaveBeenCalledTimes(1);
      const blacklist = mockBlacklistAdd.mock.calls[0][0];
      expect(blacklist).toHaveLength(2);
      expect(blacklist).not.toContain(idA);
      expect(blacklist).not.toContain(idB);
    });

    // Move sense 3 from B to A
    it("moves sense between words", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1], ID2: [S2], ID3: [S3] });
      const WB = newMergeTreeWord(vernB, { ID1: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: { ...defaultMergeState, data, tree },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const parentA = wordAnyGuids(
        vernA,
        [senses["S1"], senses["S2"], senses["S3"]],
        idA
      );
      const parentB = wordAnyGuids(vernB, [senses["S4"]], idB);
      const childA = { srcWordId: idA, getAudio: true };
      const childAB = { srcWordId: idB, getAudio: false };
      const childBB = { srcWordId: idB, getAudio: true };
      const mockMerges = [
        newMergeWords(parentA, [childA, childAB]),
        newMergeWords(parentB, [childBB]),
      ];
      for (const mergeWords of mockMerges) {
        expect(mockMergeWords.mock.calls[0][0]).toContainEqual(mergeWords);
      }

      expect(mockBlacklistAdd).toHaveBeenCalledTimes(1);
      const blacklist = mockBlacklistAdd.mock.calls[0][0];
      expect(blacklist).toHaveLength(2);
      expect(blacklist).not.toContain(idA);
      expect(blacklist).not.toContain(idB);
    });

    // Merge sense 1 and 2 in A as duplicates
    it("merges senses within a word", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1, S2] });
      const WB = newMergeTreeWord(vernB, { ID1: [S3], ID2: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: { ...defaultMergeState, data, tree },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);

      const parent = wordAnyGuids(vernA, [senses["S1"]], idA);
      const child = { srcWordId: idA, getAudio: true };
      const mockMerge = newMergeWords(parent, [child]);
      expect(mockMergeWords).toHaveBeenCalledWith([mockMerge]);

      expect(mockBlacklistAdd).toHaveBeenCalledTimes(1);
      const blacklist = mockBlacklistAdd.mock.calls[0][0];
      expect(blacklist).toHaveLength(2);
      expect(blacklist).not.toContain(idA);
      expect(blacklist).toContain(idB);
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
          deletedSenseGuids: [S2],
        },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const parent = wordAnyGuids(vernA, [senses["S1"]], idA);
      const child = { srcWordId: idA, getAudio: true };
      const mockMerge = newMergeWords(parent, [child]);
      expect(mockMergeWords).toHaveBeenCalledWith([mockMerge]);

      expect(mockBlacklistAdd).toHaveBeenCalledTimes(1);
      const blacklist = mockBlacklistAdd.mock.calls[0][0];
      expect(blacklist).toHaveLength(2);
      expect(blacklist).not.toContain(idA);
      expect(blacklist).toContain(idB);
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
          deletedSenseGuids: [S3, S4],
        },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const child = { srcWordId: idB, getAudio: false };
      const mockMerge = newMergeWords(wordB, [child], true);
      expect(mockMergeWords).toHaveBeenCalledWith([mockMerge]);

      // No blacklist entry added for only 1 resulting word.
      expect(mockBlacklistAdd).not.toHaveBeenCalled();
    });
    // Move all senses from B to A
    it("moves all senses to other word", async () => {
      const WA = newMergeTreeWord(vernA, {
        ID1: [S1, S3],
        ID2: [S2],
        ID3: [S4],
      });
      const tree: MergeTree = { ...defaultTree, words: { WA } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: { ...defaultMergeState, data, tree },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);
      const parentA = wordAnyGuids(
        vernA,
        [senses["S1"], senses["S2"], senses["S4"]],
        idA
      );
      const childA = { srcWordId: idA, getAudio: true };
      const childB = { srcWordId: idB, getAudio: true };
      const mockMerge = newMergeWords(parentA, [childA, childB]);
      expect(mockMergeWords).toHaveBeenCalledWith([mockMerge]);

      // No blacklist entry added for only 1 resulting word.
      expect(mockBlacklistAdd).not.toHaveBeenCalled();
    });

    // Move all senses from B to A
    it("moves all senses to other word", async () => {
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
      const parentA = wordAnyGuids(
        vernA,
        [senses["S1"], senses["S4"], senses["S2"]],
        idA
      );
      const childA = { srcWordId: idA, getAudio: true };
      const childB = { srcWordId: idB, getAudio: true };
      const mockMerge = newMergeWords(parentA, [childA, childB]);
      expect(mockMergeWords).toHaveBeenCalledWith([mockMerge]);

      // No blacklist entry added for only 1 resulting word.
      expect(mockBlacklistAdd).not.toHaveBeenCalled();
    });

    // Performs a merge when a word is flagged
    it("adds a flag to a word", async () => {
      const WA = newMergeTreeWord(vernA, { ID1: [S1], ID2: [S2] });
      WA.flag = newFlag("New flag");
      const WB = newMergeTreeWord(vernB, { ID1: [S3], ID2: [S4] });
      const tree: MergeTree = { ...defaultTree, words: { WA, WB } };
      const store = setupStore({
        ...preloadedState,
        mergeDuplicateGoal: { ...defaultMergeState, data, tree },
      });
      await store.dispatch(mergeAll());

      expect(mockMergeWords).toHaveBeenCalledTimes(1);

      const parent = wordAnyGuids(vernA, [senses["S1"], senses["S2"]], idA);
      parent.flag = WA.flag;
      const child = { srcWordId: idA, getAudio: true };
      const mockMerge = newMergeWords(parent, [child]);
      expect(mockMergeWords).toHaveBeenCalledWith([mockMerge]);

      expect(mockBlacklistAdd).toHaveBeenCalledTimes(1);
      const blacklist = mockBlacklistAdd.mock.calls[0][0];
      expect(blacklist).toHaveLength(2);
      expect(blacklist).not.toContain(idA);
      expect(blacklist).toContain(idB);
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
        mergeDuplicateGoal: { ...defaultMergeState, data, tree },
      });
      store.dispatch(deferMerge());
      expect(mockGraylistAdd).toHaveBeenCalledTimes(1);
    });
  });
});
