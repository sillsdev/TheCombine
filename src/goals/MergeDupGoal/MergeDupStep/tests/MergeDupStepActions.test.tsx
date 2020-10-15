import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import * as backend from "../../../../backend";
import {
  makeSense,
  MergeWord,
  multiGlossWord,
  State,
  Word,
} from "../../../../types/word";
import { MergeDups } from "../../MergeDups";
import { mergeAll } from "../MergeDupStepActions";
import { MergeData, MergeTree, Hash } from "../MergeDupsTree";
import { goalDataMock } from "./MockMergeDupData";

type mockWordListIndex = "WA" | "WB" | "WA2" | "WB2";
const mockWordList = {
  WA: { ...multiGlossWord("AAA", ["Sense 1", "Sense 2"]), id: "WA" },
  WB: { ...multiGlossWord("BBB", ["Sense 3", "Sense 4"]), id: "WB" },
  WA2: {
    ...multiGlossWord("AAA", ["Sense 1", "Sense 2"]),
    id: "WA2",
    history: ["WA", "WB"],
  },
  WB2: {
    ...multiGlossWord("BBB", ["Sense 4"]),
    id: "WB2",
    history: ["WB"],
  },
};

const mockMerge0: { parent: Word; children: MergeWord[] } = {
  parent: { ...mockWordList["WA2"], id: "WA", history: [] },
  children: [
    { wordID: "WA", senses: [State.Sense, State.Sense] },
    { wordID: "WB", senses: [State.Duplicate, State.Separate] },
  ],
};
const mockMerge1: { parent: Word; children: MergeWord[] } = {
  parent: { ...mockWordList["WB2"], history: [], id: "WB" },
  children: [{ wordID: "WB2", senses: [State.Sense] }],
};
function mockMergeWords(parent: Word, children: MergeWord[]) {
  expect([mockMerge0, mockMerge1]).toContainEqual({ parent, children });
  const mergeList: Hash<string[]> = {};
  mergeList[JSON.stringify(mockMerge0)] = ["WA2", "WB2"];
  mergeList[JSON.stringify(mockMerge1)] = ["WB2"];
  const args = JSON.stringify({ parent, children });
  return Promise.resolve(mergeList[args]);
}

jest.mock("../../../../backend", () => {
  const realBackend = jest.requireActual("../../../../backend");
  return {
    ...realBackend,
    mergeWords: jest.fn((parent: Word, children: MergeWord[]) =>
      mockMergeWords(parent, children)
    ),
    getWord: jest.fn((id: mockWordListIndex) => {
      return Promise.resolve(mockWordList[id]);
    }),
  };
});

const mockGoal = new MergeDups();
mockGoal.data = goalDataMock;
mockGoal.steps = [{ words: [] }, { words: [] }];
const createMockStore = configureMockStore([thunk]);

const mockStoreState = {
  goalsState: {
    historyState: { history: [mockGoal] },
    allPossibleGoals: [],
    suggestionsState: { suggestions: [] },
  },
  mergeDuplicateGoal: { mergeTreeState: { data: {}, tree: {} } },
};

const data: { data: MergeData } = {
  data: {
    words: {
      WA: { ...multiGlossWord("AAA", ["Sense 1", "Sense 2"]), id: "WA" },
      WB: { ...multiGlossWord("BBB", ["Sense 3", "Sense 4"]), id: "WB" },
    },
    senses: {
      S1: { ...makeSense("Sense 1"), srcWord: "WA", order: 0 },
      S2: { ...makeSense("Sense 2"), srcWord: "WA", order: 1 },
      S3: { ...makeSense("Sense 3"), srcWord: "WB", order: 0 },
      S4: { ...makeSense("Sense 4"), srcWord: "WB", order: 1 },
    },
  },
};

// Merge sense 1 and 3 as duplicates
const treeA: { tree: MergeTree } = {
  tree: {
    words: {
      WA: {
        senses: { ID1: { ID1: "S1", ID2: "S3" }, ID2: { ID1: "S2" } },
        vern: "AAA",
        plural: "AAAS",
      },
      WB: { senses: { ID1: { ID1: "S4" } }, vern: "BBB", plural: "BBBS" },
    },
  },
};

// Don't merge
const treeB: { tree: MergeTree } = {
  tree: {
    words: {
      WA: {
        senses: { ID1: { ID1: "S1" }, ID2: { ID1: "S2" } },
        vern: "AAA",
        plural: "AAAS",
      },
      WB: {
        senses: { ID1: { ID1: "S3" }, ID2: { ID1: "S4" } },
        vern: "BBB",
        plural: "BBBS",
      },
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("test merge", async () => {
  let parent = { ...data.data.words.WA };
  let children = [
    { wordID: "WA", senses: [State.Sense, State.Sense] },
    { wordID: "WB", senses: [State.Duplicate, State.Separate] },
  ];

  const mockStore = createMockStore({
    ...mockStoreState,
    mergeDuplicateGoal: { mergeTreeState: { ...data, ...treeA } },
  });

  await mockStore.dispatch<any>(mergeAll());

  expect(backend.mergeWords).toHaveBeenCalledWith(parent, children);
});

test("test non-merge", async () => {
  const mockStore = createMockStore({
    ...mockStoreState,
    mergeDuplicateGoal: { mergeTreeState: { ...data, ...treeB } },
  });

  await mockStore.dispatch<any>(mergeAll());

  expect(backend.mergeWords).toHaveBeenCalledTimes(0);
});
