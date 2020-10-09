import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import * as utilities from "../../../../utilities";
import ReviewEntriesConnected from "../ReviewEntriesComponent";
import { OLD_SENSE } from "../ReviewEntriesTypes";
import mockWords, { mockCreateWord } from "./MockWords";

jest.mock("../../../../backend", () => {
  return {
    getFrontierWords: jest.fn(() => {
      return Promise.resolve(
        mockWords.map((word) => mockCreateWord(word, "en"))
      );
    }),
  };
});

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

// Standard dialog mockout
jest.mock("@material-ui/core", () => {
  const material = jest.requireActual("@material-ui/core");
  return {
    ...material,
    Dialog: material.Container,
  };
});

// Mock uuid generation
jest.mock("../../../../utilities", () => {
  return {
    uuid: jest.fn(),
  };
});
const MOCK_UUID = (utilities as jest.Mocked<typeof utilities>).uuid;

// This was a last resort to deal with the table not wanting to behave in testing. Approved by project head
jest.mock("material-table", () => {
  const material = jest.requireActual("@material-ui/core");
  return {
    __esModule: true,
    default: material.Container,
  };
});

// Mock the node module used by AudioRecorder
jest.mock("../../../../components/Pronunciations/Recorder");

// Mock to spy on updating words
const MOCK_UPDATE = jest.fn();

beforeAll(() => {
  // Prep for component creation
  for (let word of mockWords) {
    for (let sense of word.senses)
      MOCK_UUID.mockImplementationOnce(() => sense.senseId);
  }

  // Create + mount + unmount
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <ReviewEntriesConnected
        words={mockWords}
        language="en"
        setAnalysisLanguage={jest.fn()}
        clearState={jest.fn()}
        updateAllWords={MOCK_UPDATE}
        updateFrontierWord={jest.fn()}
      />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});

describe("ReviewEntriesComponent", () => {
  it("Initializes correctly in beforeAll", () => {
    // Check creation
    expect(MOCK_UPDATE).toHaveBeenCalledWith(
      mockWords.map((value) => ({
        ...value,
        senses: value.senses.map((sense) => ({
          ...sense,
          senseId: sense.senseId + OLD_SENSE,
        })),
        recorder: expect.any(Object),
      }))
    );
  });
});
