import { multiGlossWord, State, Word, MergeWord } from "../../../../types/word";
import thunk from "redux-thunk";
import { mergeAll } from "../MergeDupStepActions";
import * as backend from "../../../../backend";
import configureMockStore from "redux-mock-store";
import { MergeData, MergeTree, Hash } from "../MergeDupsTree";
import { MergeDups } from "../../MergeDups";
import { goalDataMock } from "./MockMergeDupData";

jest.mock("../../../../backend", () => {
  return {
    ...jest.requireActual("../../../../backend"),
    mergeWords: jest.fn((parent: Word, children: MergeWord[]) => {
      const { multiGlossWord, State } = jest.requireActual(
        "../../../../types/word"
      );
      // Setup data needed to mock
      const wordList = {
        WA: { ...multiGlossWord("AAA", ["Sense 1", "Sense 2"]), id: "WA" },
        WB: { ...multiGlossWord("BBB", ["Sense 3", "Sense 4"]), id: "WB" },
        WA2: {
          ...multiGlossWord("AAA", ["Sense 1", "Sense 2"]),
          id: "WA2",
          history: ["WA", "WB"]
        },
        WB2: {
          ...multiGlossWord("BBB", ["Sense 4"]),
          id: "WB2",
          history: ["WB"]
        }
      };
      const M0: { parent: Word; children: MergeWord[] } = {
        parent: { ...wordList["WA2"], id: "WA", history: [] },
        children: [
          { wordID: "WA", senses: [State.sense, State.sense] },
          { wordID: "WB", senses: [State.duplicate, State.separate] }
        ]
      };

      const M1: { parent: Word; children: MergeWord[] } = {
        parent: { ...wordList["WB2"], history: [], id: "WB" },
        children: [{ wordID: "WB2", senses: [State.sense] }]
      };

      expect([M0, M1]).toContainEqual({ parent, children });

      let mergeList: Hash<string[]> = {};
      mergeList[JSON.stringify(M0)] = ["WA2", "WB2"];
      mergeList[JSON.stringify(M1)] = ["WB2"];
      let args = JSON.stringify({ parent, children });

      return Promise.resolve(mergeList[args]);
    }),
    getWord: jest.fn((id: string) => {
      const { multiGlossWord, State } = jest.requireActual(
        "../../../../types/word"
      );
      const wordList = {
        WA: { ...multiGlossWord("AAA", ["Sense 1", "Sense 2"]), id: "WA" },
        WB: { ...multiGlossWord("BBB", ["Sense 3", "Sense 4"]), id: "WB" },
        WA2: {
          ...multiGlossWord("AAA", ["Sense 1", "Sense 2"]),
          id: "WA2",
          history: ["WA", "WB"]
        },
        WB2: {
          ...multiGlossWord("BBB", ["Sense 4"]),
          id: "WB2",
          history: ["WB"]
        }
      };

      return Promise.resolve(wordList[id]);
    })
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

test("test merge", async () => {
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
