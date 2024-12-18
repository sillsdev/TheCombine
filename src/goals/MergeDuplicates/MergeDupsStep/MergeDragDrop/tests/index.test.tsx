import { IconButton } from "@mui/material";
import { Provider } from "react-redux";
import { type ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { GramCatGroup, type Sense } from "api/models";
import MergeDragDrop from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop";
import DragSense from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop/DragSense";
import DropWord from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop/DropWord";
import {
  convertSenseToMergeTreeSense,
  defaultTree,
  newMergeTreeWord,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import {
  type MergeTreeState,
  defaultState as mergeState,
} from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { defaultState } from "rootRedux/types";
import { newSemanticDomain } from "types/semanticDomain";
import {
  newDefinition,
  newGrammaticalInfo,
  newSense,
  newWord,
} from "types/word";

jest.mock("react-beautiful-dnd", () => ({
  ...jest.requireActual("react-beautiful-dnd"),
  Draggable: ({ children }: any) =>
    children({ draggableProps: {}, innerRef: jest.fn() }, {}, {}),
  Droppable: ({ children }: any) => children({ innerRef: jest.fn() }, {}),
}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("backend", () => ({}));
jest.mock("goals/MergeDuplicates/Redux/MergeDupsActions", () => ({
  setSidebar: (...args: any[]) => mockSetSidebar(...args),
}));
jest.mock("i18n", () => ({}));
jest.mock("rootRedux/hooks", () => {
  return {
    ...jest.requireActual("rootRedux/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const mockSetSidebar = jest.fn();

let testRenderer: ReactTestRenderer;

// Words/Senses to be used for a preloaded mergeDuplicateGoal state
const senseBah: Sense = {
  ...newSense("bah"),
  guid: "guid-sense-bah",
  definitions: [newDefinition("defBah")],
};
const senseBaj: Sense = {
  ...newSense("baj"),
  guid: "guid-sense-baj",
  definitions: [newDefinition("defBaj")],
};
const senseBar: Sense = {
  ...newSense("bar"),
  guid: "guid-sense-bar",
  semanticDomains: [newSemanticDomain("3", "Language and thought")],
};
const senseBaz: Sense = {
  ...newSense("baz"),
  guid: "guid-sense-baz",
  grammaticalInfo: { ...newGrammaticalInfo(), catGroup: GramCatGroup.Verb },
};

const wordFoo1 = {
  ...newWord("foo"),
  id: "wordId-foo1",
  senses: [senseBah, senseBaj],
};
const wordFoo2 = {
  ...newWord("foo"),
  id: "wordId-foo2",
  senses: [senseBar, senseBaz],
};

// Scenario:
//   Word1:
//     vern: foo
//     senses: bah/baj
//   Word2:
//     vern: foo
//     senses: bar, baz
const mockTwoWordState = (): MergeTreeState => ({
  ...mergeState,
  data: {
    senses: {
      [senseBah.guid]: convertSenseToMergeTreeSense(senseBah, wordFoo1.id, 0),
      [senseBaj.guid]: convertSenseToMergeTreeSense(senseBaj, wordFoo1.id, 1),
      [senseBar.guid]: convertSenseToMergeTreeSense(senseBar, wordFoo2.id, 0),
      [senseBaz.guid]: convertSenseToMergeTreeSense(senseBaz, wordFoo2.id, 1),
    },
    words: { [wordFoo1.id]: wordFoo1, [wordFoo2.id]: wordFoo2 },
  },
  tree: {
    ...defaultTree,
    words: {
      [wordFoo1.id]: newMergeTreeWord(wordFoo1.vernacular, {
        word1_senseA: [senseBah.guid, senseBaj.guid],
      }),
      [wordFoo2.id]: newMergeTreeWord(wordFoo2.vernacular, {
        word2_senseA: [senseBar.guid],
        word2_senseB: [senseBaz.guid],
      }),
    },
  },
});

const renderMergeDragDrop = async (
  mergeDuplicateGoal: MergeTreeState
): Promise<void> => {
  await act(async () => {
    testRenderer = create(
      <Provider
        store={configureMockStore()({ ...defaultState, mergeDuplicateGoal })}
      >
        <MergeDragDrop />
      </Provider>
    );
  });
};

beforeEach(async () => {
  jest.clearAllMocks();
  await renderMergeDragDrop(mockTwoWordState());
});

describe("MergeDragDrop", () => {
  it("render all columns with right number of senses", async () => {
    const wordCols = testRenderer.root.findAllByType(DropWord);
    expect(wordCols).toHaveLength(3);
    expect(wordCols[0].findAllByType(DragSense)).toHaveLength(1);
    expect(wordCols[1].findAllByType(DragSense)).toHaveLength(2);
    expect(wordCols[2].findAllByType(DragSense)).toHaveLength(0);
  });

  it("renders with button for opening the sidebar", async () => {
    const iconButtons = testRenderer.root.findAllByType(IconButton);
    const sidebarButtons = iconButtons.filter((b) =>
      b.props.id.includes("sidebar")
    );
    expect(sidebarButtons).toHaveLength(1);
    mockSetSidebar.mockReset();
    await act(async () => {
      sidebarButtons[0].props.onClick();
    });
    expect(mockSetSidebar).toHaveBeenCalledTimes(1);
    const callArg = mockSetSidebar.mock.calls[0][0];
    expect(callArg.senseRef.mergeSenseId).toEqual("word1_senseA");
  });
});
