import React from "react";
import DataEntryTable, { filterWords } from "../DataEntryTable";
import { mockDomainTree } from "../../tests/MockDomainTree";
import { SemanticDomain, Word, State } from "../../../../types/word";
import { mockWord } from "../../tests/MockWord";
import axios from "axios";
import { Project } from "../../../../types/project";
import { AutoComplete } from "../../../../types/AutoComplete";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../../App/DefaultState";
import { Provider } from "react-redux";
import renderer, {
  ReactTestRenderer,
  ReactTestInstance,
} from "react-test-renderer";
import { NewEntry } from "../NewEntry/NewEntry";

export const mockSemanticDomain: SemanticDomain = {
  name: "",
  id: "",
};

jest.mock("../../../Pronunciations/Recorder");
jest.mock("axios");

var testRenderer: ReactTestRenderer;
const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

// mocks the axios post call and return empty data for all paths
var mockAxiosPost = jest.fn().mockImplementation((url: string, data: any) => {
  return Promise.resolve({ data: "" });
});
axios.post = mockAxiosPost;

beforeAll(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <DataEntryTable
          domain={mockDomainTree}
          semanticDomain={mockSemanticDomain}
          displaySemanticDomainView={(isGettingSemanticdomain: boolean) => {}}
        />
      </Provider>
    );
  });
});

beforeEach(() => {
  mockAxiosPost.mockClear();
});

describe("Tests DataEntryTable", () => {
  mockAxiosGet();
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
    mockAxiosPost.mockClear();
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
        // Assert that the axios function for adding the word was called
        expect(mockAxiosPost.mock.calls.length).toBe(1);
        expect(mockAxiosPost.mock.calls[0][1]).toBe(newEntryWord);
        done();
      }
    );
  });

  it("should NOT call add word on backend when new entry has no data and complete is clicked", (done) => {
    mockAxiosPost.mockClear();
    // Verify that NewEntry is present
    let newEntryItems = testRenderer.root.findAllByType(NewEntry);
    expect(newEntryItems.length).toBe(1);
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
        // Assert that the axios function for adding the word was called
        expect(mockAxiosPost.mock.calls.length).toBe(0);
        done();
      }
    );
  });

  // mocks the get method for axios providing mocked returns for some functions
  function mockAxiosGet() {
    const mockProject: Project = {
      id: "testProj",
      name: "Test Proj",
      semanticDomains: [],
      userRoles: "",
      vernacularWritingSystem: "",
      analysisWritingSystems: [],
      validCharacters: [],
      rejectedCharacters: [],
      wordFields: [],
      partsOfSpeech: [],
      words: [mockWord],
      customFields: [],
      autocompleteSetting: AutoComplete.Off,
    };

    // mock the api return of the words frontier
    const frontierResponse = { data: [mockWord] };
    // mock the api return of the project (for autocomplete state checking)
    const autocompleteResponse = { data: mockProject };
    axios.get = jest.fn().mockImplementation((url: string) => {
      if (url.startsWith("projects")) {
        if (url.endsWith("/words/frontier")) {
          return Promise.resolve(frontierResponse);
        } else if (url === "projects/") {
          return Promise.resolve(autocompleteResponse);
        }
      }
      return Promise.resolve({ data: "" });
    });
  }
});
