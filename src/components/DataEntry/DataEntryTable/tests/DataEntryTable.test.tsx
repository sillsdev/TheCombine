import React from "react";
import { Provider } from "react-redux";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import * as backend from "../../../../backend";
import { defaultProject as mockProject } from "../../../../types/project";
import { SemanticDomain, State, Word } from "../../../../types/word";
import { defaultState } from "../../../App/DefaultState";
import { filterWords } from "../../DataEntryComponent";
import { baseDomain } from "../../../../types/SemanticDomain";
import { mockWord } from "../../tests/MockWord";
import DataEntryTable from "../DataEntryTable";
import { NewEntry } from "../NewEntry/NewEntry";

export const mockSemanticDomain: SemanticDomain = {
  name: "",
  id: "",
};

jest.mock("../../../Pronunciations/Recorder");
// mock the functions in the backend that these tests exercise
jest.mock("../../../../backend", () => {
  return {
    createWord: jest.fn((_word: Word) => {
      return Promise.resolve(mockWord);
    }),
    getFrontierWords: jest.fn(() => {
      return Promise.resolve([mockWord]);
    }),
    getProject: jest.fn((_id: string) => {
      return Promise.resolve(mockProject);
    }),
  };
});

var testRenderer: ReactTestRenderer;
const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);
const hideQuestionsMock = jest.fn();

beforeEach(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <DataEntryTable
          domain={baseDomain}
          semanticDomain={mockSemanticDomain}
          displaySemanticDomainView={(_isGettingSemanticDomain: boolean) => {}}
          isSmallScreen={false}
          hideQuestions={hideQuestionsMock}
          getWordsFromBackend={() => {
            return new Promise(() => []);
          }}
          showExistingData={() => {}}
        />
      </Provider>
    );
  });
});

describe("Tests DataEntryTable", () => {
  it("should filter out words that are not accessible", () => {
    let words: Word[] = [];
    let expectedWords: Word[] = [];
    expect(filterWords(words)).toEqual(expectedWords);
  });

  it("should filter out words that are inaccessible", () => {
    let word = { ...mockWord };
    word.senses[0].accessibility = State.active;
    let words: Word[] = [
      {
        ...mockWord,
        senses: [
          {
            glosses: [],
            semanticDomains: [],
          },
        ],
      },
    ];
    let expectedWords: Word[] = [];
    expect(filterWords(words)).toEqual(expectedWords);
  });

  it("should filter out words that are inaccessible", () => {
    let word = { ...mockWord };
    word.senses[0].accessibility = State.active;
    let words: Word[] = [
      {
        ...mockWord,
        senses: [
          {
            glosses: [],
            semanticDomains: [],
            accessibility: State.active,
          },
        ],
      },
    ];
    let expectedWords: Word[] = [...words];
    expect(filterWords(words)).toEqual(expectedWords);
  });

  it("should call add word on backend when new entry has data and complete is clicked", (done) => {
    jest.clearAllMocks();
    // Verify that NewEntry is present
    let newEntryItems = testRenderer.root.findAllByType(NewEntry);
    expect(newEntryItems.length).toBe(1);
    var newEntryWord: Word = {
      id: "",
      vernacular: "hasvernword",
      senses: [
        {
          glosses: [
            {
              language: "en",
              def: "",
            },
          ],
          semanticDomains: [],
        },
      ],
      audio: [],
      created: "",
      modified: "",
      history: [],
      partOfSpeech: "",
      editedBy: [],
      otherField: "",
      plural: "",
    };
    var newEntryHandle: ReactTestInstance = newEntryItems[0];
    newEntryHandle.instance.setState(
      {
        newEntry: newEntryWord,
      },
      () => {
        // Get button for complete and push it
        testRenderer.root.findByProps({ id: "complete" }).props.onClick();
        // Assert that the backend function for adding the word was called
        expect(backend.createWord).toBeCalled();
        done();
      }
    );
  });

  it("should NOT call add word on backend when new entry has no data and complete is clicked", (done) => {
    jest.clearAllMocks();
    // Verify that NewEntry is present
    let newEntryItems = testRenderer.root.findAllByType(NewEntry);
    expect(newEntryItems.length).toBe(1);
    // set the new entry to have no useful content
    var newEntryWord: Word = {
      id: "",
      vernacular: "",
      senses: [
        {
          glosses: [
            {
              language: "en",
              def: "",
            },
          ],
          semanticDomains: [],
        },
      ],
      audio: [],
      created: "",
      modified: "",
      history: [],
      partOfSpeech: "",
      editedBy: [],
      otherField: "",
      plural: "",
    };
    var newEntryHandle: ReactTestInstance = newEntryItems[0];
    newEntryHandle.instance.setState(
      {
        newEntry: newEntryWord,
      },
      () => {
        // Get button for complete and push it
        testRenderer.root.findByProps({ id: "complete" }).props.onClick();
        // Assert that the backend function for adding the word was NOT called
        expect(backend.createWord).not.toBeCalled();
        done();
      }
    );
  });

  it("calls hideQuestions when complete is clicked", () => {
    jest.clearAllMocks();
    testRenderer.root.findByProps({ id: "complete" }).props.onClick();
    expect(hideQuestionsMock).toBeCalledTimes(1);
  });
});
