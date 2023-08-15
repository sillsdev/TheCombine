import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import ReviewEntriesComponent from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesComponent";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import mockWords, {
  mockCreateWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/tests/WordsMock";
import { defaultWritingSystem } from "types/writingSystem";

const mockGetFrontierWords = jest.fn();
const mockMaterialTable = jest.fn();
const mockUpdateAllWords = jest.fn();
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
  getFrontierWords: () => mockGetFrontierWords(),
}));
// Mock the node module used by AudioRecorder.
jest.mock("components/Pronunciations/Recorder");
jest.mock("components/TreeView", () => "div");

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
  reviewEntriesState: { words: mockReviewEntryWords },
  treeViewState: {
    open: false,
    currentDomain: {
      name: "domain",
      id: "number",
      subdomains: [],
    },
  },
};
const mockStore = configureMockStore()(state);

function setMockFunctions() {
  mockGetFrontierWords.mockResolvedValue(
    mockReviewEntryWords.map(mockCreateWord)
  );
  mockMaterialTable.mockReturnValue(React.Fragment);
}

beforeEach(async () => {
  // Prep for component creation
  setMockFunctions();
  for (const word of mockReviewEntryWords) {
    for (const sense of word.senses) {
      mockUuid.mockImplementationOnce(() => sense.guid);
    }
  }

  await renderer.act(async () => {
    renderer.create(
      <Provider store={mockStore}>
        <ReviewEntriesComponent
          updateAllWords={mockUpdateAllWords}
          updateFrontierWord={jest.fn()}
        />
      </Provider>
    );
  });
});

describe("ReviewEntriesComponent", () => {
  it("Initializes correctly", () => {
    expect(mockUpdateAllWords).toHaveBeenCalledTimes(1);
    const wordIds = mockUpdateAllWords.mock.calls[0][0].map(
      (w: ReviewEntriesWord) => w.id
    );
    expect(wordIds).toHaveLength(mockReviewEntryWords.length);
    mockReviewEntryWords.forEach((w) => expect(wordIds).toContain(w.id));
  });
});
