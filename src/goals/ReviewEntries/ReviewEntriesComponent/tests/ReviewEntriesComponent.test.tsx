import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import ReviewEntriesComponent from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesComponent";
import mockWords, {
  mockCreateWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";

const mockGetFrontierWords = jest.fn();
const mockMaterialTable = jest.fn();
const mockUpdateAllWords = jest.fn();
const mockUuid = jest.fn();

// Standard dialog mockout.
jest.mock("@material-ui/core", () => {
  const material = jest.requireActual("@material-ui/core");
  return {
    ...material,
    Dialog: material.Container,
  };
});
jest.mock("backend", () => {
  return {
    getFrontierWords: () => mockGetFrontierWords(),
  };
});
// Mock the node module used by AudioRecorder.
jest.mock("components/Pronunciations/Recorder");
jest.mock("uuid", () => {
  return {
    v4: () => mockUuid(),
  };
});
// To deal with the table not wanting to behave in testing.
jest.mock("@material-table/core", () => {
  return {
    __esModule: true,
    default: () => mockMaterialTable(),
  };
});

// Mock store + axios
const mockReviewEntryWords = mockWords();
const state = {
  reviewEntriesState: {
    words: mockReviewEntryWords,
  },
  treeViewState: {
    currentDomain: {
      name: "domain",
      id: "number",
      subdomains: [],
    },
  },
};
const mockStore = configureMockStore([])(state);

function setMockFunctions() {
  mockGetFrontierWords.mockResolvedValue(
    mockReviewEntryWords.map((w) => mockCreateWord(w))
  );
  mockMaterialTable.mockReturnValue(React.Fragment);
}

beforeEach(() => {
  // Prep for component creation
  setMockFunctions();
  for (let word of mockReviewEntryWords) {
    for (let sense of word.senses)
      mockUuid.mockImplementationOnce(() => sense.guid);
  }

  renderer.act(() => {
    renderer.create(
      <Provider store={mockStore}>
        <ReviewEntriesComponent
          clearState={jest.fn()}
          updateAllWords={mockUpdateAllWords}
          updateFrontierWord={jest.fn()}
        />
      </Provider>
    );
  });
});

describe("ReviewEntriesComponent", () => {
  it("Initializes correctly", () => {
    expect(mockUpdateAllWords).toHaveBeenCalledWith(
      mockReviewEntryWords.map((word) => ({
        ...word,
        recorder: expect.any(Object),
      }))
    );
  });
});
