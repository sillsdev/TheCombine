import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import ReviewEntriesComponent from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesComponent";
import { ReviewEntriesSense } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import mockWords, {
  mockCreateWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";

// Mock store + axios
const state = {
  reviewEntriesState: {
    language: "en",
    words: mockWords,
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
jest.mock("utilities", () => {
  return {
    uuid: () => mockUuid(),
  };
});
// To deal with the table not wanting to behave in testing.
jest.mock("@material-table/core", () => {
  return {
    __esModule: true,
    default: () => mockMaterialTable(),
  };
});

const mockGetFrontierWords = jest.fn();
const mockMaterialTable = jest.fn();
const mockUpdateAllWords = jest.fn();
const mockUuid = jest.fn();
function setMockFunctions() {
  mockGetFrontierWords.mockResolvedValue(
    mockWords.map((word) => mockCreateWord(word))
  );
  mockMaterialTable.mockReturnValue(React.Fragment);
}

beforeEach(() => {
  // Prep for component creation
  setMockFunctions();
  for (let word of mockWords) {
    for (let sense of word.senses)
      mockUuid.mockImplementationOnce(() => sense.senseId);
  }

  renderer.act(() => {
    renderer.create(
      <Provider store={mockStore}>
        <ReviewEntriesComponent
          language="en"
          setAnalysisLanguage={jest.fn()}
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
      mockWords.map((value) => ({
        ...value,
        senses: value.senses.map((sense) => ({
          ...sense,
          senseId: sense.senseId + ReviewEntriesSense.OLD_SENSE,
        })),
        recorder: expect.any(Object),
      }))
    );
  });
});
