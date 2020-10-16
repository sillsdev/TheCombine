import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import * as backend from "../../../../backend";
import {
  MergeWord,
  multiGlossWord,
  Sense,
  State,
  Word,
} from "../../../../types/word";
import { MergeDups } from "../../MergeDups";
import { mergeAll } from "../MergeDupStepActions";
import { MergeData, MergeTree, Hash } from "../MergeDupsTree";
import { goalDataMock } from "./MockMergeDupData";

type mockWordListIndex = "WA" | "WB" | "WA2" | "WB2" | "WA3" | "WA4";
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
  WA3: {
    ...multiGlossWord("AAA", ["Sense 1", "Sense 2", "Sense 3"]),
    id: "WA3",
    history: ["WA", "WB"],
  },
  WA4: {
    ...multiGlossWord("AAA", ["Sense 1"]),
    id: "WA4",
    history: ["WA"],
  },
};

// mockMergeN is for test treeN below
interface parentWithMergeChildren {
  parent: Word;
  children: MergeWord[];
}
const mockMerge2a: parentWithMergeChildren = {
  parent: { ...mockWordList["WA2"], id: "WA", history: [] },
  children: [
    { wordID: "WA", senses: [State.Sense, State.Sense] },
    { wordID: "WB", senses: [State.Duplicate, State.Separate] },
  ],
};
const mockMerge2b: parentWithMergeChildren = {
  parent: { ...mockWordList["WB2"], id: "WB", history: [] },
  children: [{ wordID: "WB2", senses: [State.Sense] }],
};
const mockMerge3a: parentWithMergeChildren = {
  parent: { ...mockWordList["WA3"], id: "WA", history: [] },
  children: [
    { wordID: "WA", senses: [State.Sense, State.Sense] },
    { wordID: "WB", senses: [State.Sense, State.Separate] },
  ],
};
const mockMerge3b = mockMerge2b;
const mockMerge4a: parentWithMergeChildren = {
  parent: { ...mockWordList["WA4"], id: "WA", history: [] },
  children: [{ wordID: "WA", senses: [State.Sense, State.Duplicate] }],
};

const mockMerges = [mockMerge2a, mockMerge2b, mockMerge3a, mockMerge4a];
const mergeResults = [["WA2", "WB2"], ["WB2"], ["WA3", "WB2"], ["WA4"]];
const mergeList: Hash<string[]> = {};
for (let i = 0; i <= mockMerges.length; i++) {
  mergeList[JSON.stringify(mockMerges[i])] = mergeResults[i];
}

function mockMergeWords(parent: Word, children: MergeWord[]) {
  expect(mockMerges).toContainEqual({ parent, children });
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
      S1: { ...new Sense("Sense 1"), srcWord: "WA", order: 0 },
      S2: { ...new Sense("Sense 2"), srcWord: "WA", order: 1 },
      S3: { ...new Sense("Sense 3"), srcWord: "WB", order: 0 },
      S4: { ...new Sense("Sense 4"), srcWord: "WB", order: 1 },
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

// Don't move or merge anything
const tree1: { tree: MergeTree } = {
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
test("no merge", async () => {
  const mockStore = createMockStore({
    ...mockStoreState,
    mergeDuplicateGoal: { mergeTreeState: { ...data, ...tree1 } },
  });
  await mockStore.dispatch<any>(mergeAll());

  expect(backend.mergeWords).toHaveBeenCalledTimes(0);
});

// Merge sense 3 from B as duplicate into sense 1 from A
const tree2: { tree: MergeTree } = {
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
test("merge senses from different words", async () => {
  const mockStore = createMockStore({
    ...mockStoreState,
    mergeDuplicateGoal: { mergeTreeState: { ...data, ...tree2 } },
  });
  await mockStore.dispatch<any>(mergeAll());

  expect(backend.mergeWords).toHaveBeenCalledTimes(2);
  expect(backend.mergeWords).toHaveBeenCalledWith(
    mockMerge2a.parent,
    mockMerge2a.children
  );
  expect(backend.mergeWords).toHaveBeenCalledWith(
    mockMerge2b.parent,
    mockMerge2b.children
  );
});

// Move sense 3 from B to A
const tree3: { tree: MergeTree } = {
  tree: {
    words: {
      WA: {
        senses: { ID1: { ID1: "S1" }, ID2: { ID1: "S2" }, ID3: { ID1: "S3" } },
        vern: "AAA",
        plural: "AAAS",
      },
      WB: {
        senses: { ID1: { ID1: "S4" } },
        vern: "BBB",
        plural: "BBBS",
      },
    },
  },
};
test("move sense between words", async () => {
  const mockStore = createMockStore({
    ...mockStoreState,
    mergeDuplicateGoal: { mergeTreeState: { ...data, ...tree3 } },
  });
  await mockStore.dispatch<any>(mergeAll());

  expect(backend.mergeWords).toHaveBeenCalledTimes(2);
  expect(backend.mergeWords).toHaveBeenCalledWith(
    mockMerge3a.parent,
    mockMerge3a.children
  );
  expect(backend.mergeWords).toHaveBeenCalledWith(
    mockMerge3b.parent,
    mockMerge3b.children
  );
});

// Merge sense 1 and 2 in A as duplicates
const tree4: { tree: MergeTree } = {
  tree: {
    words: {
      WA: {
        senses: { ID1: { ID1: "S1", ID2: "S2" } },
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
test("merge senses within a word", async () => {
  const mockStore = createMockStore({
    ...mockStoreState,
    mergeDuplicateGoal: { mergeTreeState: { ...data, ...tree4 } },
  });
  await mockStore.dispatch<any>(mergeAll());

  expect(backend.mergeWords).toHaveBeenCalledTimes(1);
  expect(backend.mergeWords).toHaveBeenCalledWith(
    mockMerge4a.parent,
    mockMerge4a.children
  );
});
