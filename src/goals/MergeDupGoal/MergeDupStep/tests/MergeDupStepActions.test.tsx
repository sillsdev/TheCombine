import { multiGlossWord, State } from "../../../../types/word";
import thunk from "redux-thunk";
import { mergeAll } from "../MergeDupStepActions";
import * as backend from "../../../../backend";
import configureMockStore from "redux-mock-store";
import { MergeData, MergeTree } from "../MergeDupsTree";
import { MergeDups } from "../../MergeDups";
import { goalDataMock } from "./MockMergeDupData";

jest.mock("../../../../backend", () => {
  return {
    ...jest.requireActual("../../../../backend"),
    mergeWords: jest.fn()
  };
});

const mockGoal: MergeDups = new MergeDups();
mockGoal.data = goalDataMock;
mockGoal.steps = [
  {
    words: []
  },
  {
    words: []
  }
];
const createMockStore = configureMockStore([thunk]);

const mockStoreState = {
  goalsState: {
    historyState: {
      history: [mockGoal]
    },
    allPossibleGoals: [],
    suggestionsState: {
      suggestions: []
    }
  },
  mergeDuplicateGoal: { mergeTreeState: { data: {}, tree: {} } }
};

// when testing this I would like to make sure the right merge requests are sent
// I think I'm going to intercept the backend wrapper call and check that

const data: { data: MergeData } = {
  data: {
    words: {
      WA: { ...multiGlossWord("AAA", ["Sense 1", "Sense 2"]), id: "WA" },
      WB: { ...multiGlossWord("BBB", ["Sense 3", "Sense 4"]), id: "WB" }
    },
    senses: {
      S1: {
        glosses: [{ language: "", def: "Sense 1" }],
        semanticDomains: [],
        srcWord: "WA",
        order: 0
      },
      S2: {
        glosses: [{ language: "", def: "Sense 2" }],
        semanticDomains: [],
        srcWord: "WA",
        order: 1
      },
      S3: {
        glosses: [{ language: "", def: "Sense 3" }],
        semanticDomains: [],
        srcWord: "WB",
        order: 0
      },
      S4: {
        glosses: [{ language: "", def: "Sense 4" }],
        semanticDomains: [],
        srcWord: "WB",
        order: 1
      }
    }
  }
};

// Merge sense 1 and 3 as duplicates
const treeA: { tree: MergeTree } = {
  tree: {
    words: {
      WA: {
        senses: { ID1: { ID1: "S1", ID2: "S3" }, ID2: { ID1: "S2" } },
        vern: "AAA",
        plural: "AAAS"
      },
      WB: { senses: { ID1: { ID1: "S4" } }, vern: "BBB", plural: "BBBS" }
    }
  }
};

// Swap sense 2 and 4
const treeB: { tree: MergeTree } = {
  tree: {
    words: {
      WA: {
        senses: { ID1: { ID1: "S1" }, ID2: { ID1: "S4" } },
        vern: "AAA",
        plural: "AAAS"
      },
      WB: {
        senses: { ID1: { ID1: "S3" }, ID2: { ID1: "S2" } },
        vern: "BBB",
        plural: "BBBS"
      }
    }
  }
};

test("test simple merge", async () => {
  let parent = { ...data.data.words.WA };
  let children = [
    { wordID: "WA", senses: [State.sense, State.sense] },
    { wordID: "WB", senses: [State.duplicate, State.separate] }
  ];

  const mockStore = createMockStore({
    ...mockStoreState,
    mergeDuplicateGoal: { mergeTreeState: { ...data, ...treeA } }
  });

  await mockStore.dispatch<any>(mergeAll());

  expect(backend.mergeWords).toHaveBeenCalledWith(parent, children);
});

test("test multi step merge", async () => {
  let parentA = { ...data.data.words.WA };
  let parentB = { ...data.data.words.WB };

  let childrenA = [
    { wordID: "WA", senses: [State.sense, State.separate] },
    { wordID: "WB", senses: [State.separate, State.sense] }
  ];

  let childrenB = [
    { wordID: "WA_SEP", senses: [State.sense] },
    { wordID: "WB_SEP", senses: [State.sense] }
  ];

  const mockStore = createMockStore({
    ...mockStoreState,
    mergeDuplicateGoal: { mergeTreeState: { ...data, ...treeB } }
  });
  await mockStore.dispatch<any>(mergeAll());
  expect(backend.mergeWords).toHaveBeenCalledWith(parentA, childrenA);
  //expect(backend.mergeWords).toHaveBeenCalledWith(parentB, childrenB);
});
