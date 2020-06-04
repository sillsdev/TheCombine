import React from "react";
import configureMockStore from "redux-mock-store";
import axios from "axios";

import ReviewEntriesConnected from "../ReviewEntriesComponent";
import * as utilities from "../../../../utilities";
import mockWords from "./MockWords";
import { Provider } from "react-redux";
import { Sense, State, Word } from "../../../../types/word";
import ReactDOM from "react-dom";
import {
  OLD_SENSE,
  ReviewEntriesSense,
  ReviewEntriesWord,
  SEP_CHAR,
} from "../ReviewEntriesTypes";

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
const mockAxios = axios as jest.Mocked<typeof axios>;

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
  mockAxios.get.mockImplementationOnce(() => {
    return Promise.resolve({
      data: mockWords.map((word) => createMockWord(word, "en")),
    });
  });
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
        updateAllWords={MOCK_UPDATE}
        updateFrontierWord={jest.fn()}
      />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});

describe("Tests ReviewEntriesComponent", () => {
  it("Initialized correctly in beforeAll", () => {
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

function createMockWord(word: ReviewEntriesWord, language: string): Word {
  return {
    id: word.id,
    vernacular: word.vernacular,
    senses: word.senses.map((sense) => createMockSense(sense, language)),
    audio: [],
    created: "",
    modified: "",
    history: [],
    partOfSpeech: "",
    editedBy: [],
    otherField: "",
    plural: "",
  };
}

function createMockSense(sense: ReviewEntriesSense, language: string): Sense {
  return {
    glosses: sense.glosses
      .split(SEP_CHAR)
      .map((value) => ({ def: value.trim(), language })),
    semanticDomains: sense.domains,
    accessibility: State.active,
  };
}
