import { Fragment } from "react";
import { Provider } from "react-redux";
import { act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import ReviewEntries from "goals/ReviewEntries";
import * as actions from "goals/ReviewEntries/Redux/ReviewEntriesActions";
import { wordFromReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesTypes";
import mockWords from "goals/ReviewEntries/tests/WordsMock";
import { defaultWritingSystem } from "types/writingSystem";

const mockGetFrontierWords = jest.fn();
const mockMaterialTable = jest.fn();
const mockUuid = jest.fn();

// To deal with the table not wanting to behave in testing.
jest.mock("@material-table/core", () => ({
  __esModule: true,
  default: () => mockMaterialTable(),
}));
// Standard dialog mock-out.
jest.mock("@mui/material", () => {
  const material = jest.requireActual("@mui/material");
  return {
    ...material,
    Dialog: material.Container,
  };
});

jest.mock("notistack", () => ({
  ...jest.requireActual("notistack"),
  enqueueSnackbar: jest.fn(),
}));
jest.mock("uuid", () => ({ v4: () => mockUuid() }));
jest.mock("backend", () => ({
  getFrontierWords: (...args: any[]) => mockGetFrontierWords(...args),
}));
jest.mock("components/TreeView", () => "div");
jest.mock("components/GoalTimeline/Redux/GoalActions", () => ({}));
jest.mock("types/hooks", () => ({
  useAppDispatch: () => jest.fn(),
}));

const setAllWordsSpy = jest.spyOn(actions, "setAllWords");

// Mock store + axios
const mockReviewEntryWords = mockWords();
const state = {
  currentProjectState: {
    project: {
      analysisWritingSystems: [defaultWritingSystem],
      definitionsEnabled: true,
      vernacularWritingSystem: defaultWritingSystem,
    },
  },
  reviewEntriesState: {
    words: mockReviewEntryWords.map(wordFromReviewEntriesWord),
  },
  treeViewState: {
    open: false,
    currentDomain: { id: "number", name: "domain", subdomains: [] },
  },
};
const mockStore = configureMockStore()(state);

function setMockFunctions(): void {
  jest.clearAllMocks();
  mockGetFrontierWords.mockResolvedValue(
    mockReviewEntryWords.map(wordFromReviewEntriesWord)
  );
  mockMaterialTable.mockReturnValue(Fragment);
}

beforeEach(async () => {
  // Prep for component creation
  setMockFunctions();
  for (const word of mockReviewEntryWords) {
    for (const sense of word.senses) {
      mockUuid.mockImplementationOnce(() => sense.guid);
    }
  }

  await act(async () => {
    create(
      <Provider store={mockStore}>
        <ReviewEntries completed={false} />
      </Provider>
    );
  });
});

describe("ReviewEntries", () => {
  it("Initializes correctly", () => {
    expect(setAllWordsSpy).toHaveBeenCalled();
    const wordIds = setAllWordsSpy.mock.calls[0][0].map((w) => w.id);
    expect(wordIds).toHaveLength(mockReviewEntryWords.length);
    mockReviewEntryWords.forEach((w) => expect(wordIds).toContain(w.id));
  });
});
