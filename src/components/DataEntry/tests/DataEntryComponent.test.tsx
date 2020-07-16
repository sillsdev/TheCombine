import React from "react";
import DataEntryComponent from "../DataEntryComponent";
import SemanticDomainWithSubdomains, {
  baseDomain,
} from "../../../types/SemanticDomain";
import configureMockStore from "redux-mock-store";
import renderer, { ReactTestInstance } from "react-test-renderer";
import { Provider } from "react-redux";
import { DataEntryTable } from "../DataEntryTable/DataEntryTable";
import { DataEntryHeader } from "../DataEntryHeader/DataEntryHeader";
import { mockDomainTree } from "./MockDomainTree";
import { mockWord, mockDomainWord } from "./MockWord";
import { defaultProject as mockProject } from "../../../types/project";
import { Word, State, DomainWord } from "../../../types/word";
import {
  filterWords,
  filterWordsByDomain,
  sortDomainWordByVern,
} from "../DataEntryComponent";
import DomainTree from "../../TreeView/SemanticDomain";

jest.mock("../../../backend", () => {
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

jest.mock("../../TreeView");
jest.mock("../../AppBar/AppBarComponent"); //ReactTestRenderer doesn't like rendering UserMenu
jest.mock("@material-ui/core/Dialog");
jest.mock("../../Pronunciations/Recorder");
const createMockStore = configureMockStore([]);
const mockStore = createMockStore({});

//Needed to mock window until refactored
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

function createDataEntryComponentInstance(
  dom: SemanticDomainWithSubdomains
): ReactTestInstance {
  return renderer.create(
    <Provider store={mockStore}>
      <DataEntryComponent domain={dom} />
    </Provider>
  ).root;
}

describe("Tests DataEntryComponent", () => {
<<<<<<< HEAD
  fit("Questions hidden on complete clicked", () => {
    const newDomain = { ...baseDomain, questions: ["Q1", "Q2", "Q3"] };
    const parentInstance: ReactTestInstance = createDataEntryComponentInstance(
      newDomain
    );

    const tableInstances = parentInstance.findAllByType(DataEntryTable);
    const headerInstances = parentInstance.findAllByType(DataEntryHeader);
    expect(tableInstances.length).toBe(1);
    expect(headerInstances.length).toBe(1);
    const tableInstance = tableInstances[0];
    const headerInstance = headerInstances[0];

    const questionSwitch: ReactTestInstance = headerInstance.findByProps({
      id: "questionVisibilitySwitch",
    });
    questionSwitch.props.onChange();
    expect(questionSwitch.props.checked).toBeTruthy();
    const completeButtonHandle = tableInstance.findAllByProps({
      id: "complete",
    })[0];
    completeButtonHandle.props.onClick();
    expect(questionSwitch.props.checked).toBeFalsy();
  });

  it("should filter out words that are not accessible", () => {
=======
  it("should return empty Word Array when given empty Word Array", () => {
>>>>>>> adf204f... cleanup imports and test naming
    let words: Word[] = [];
    let expectedWords: Word[] = [];
    expect(filterWords(words)).toEqual(expectedWords);
  });

  it("should filter out words that are inaccessible", () => {
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

  it("should not filter words that are accessible", () => {
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

  it("filters out words that do not match desired domain", () => {
    jest.clearAllMocks();
    var mockDomains: DomainTree[] = [
      { ...mockDomainTree },
      { ...mockDomainTree },
    ];

    mockDomains[0].name = "daily";
    mockDomains[0].id = "123";
    mockDomains[1].name = "weather";
    mockDomains[1].id = "321";

    let unfilteredWords: Word[] = [
      { ...mockWord },
      { ...mockWord },
      { ...mockWord },
      { ...mockWord },
    ];
    unfilteredWords[0].senses[0].semanticDomains[0] = mockDomains[1];
    unfilteredWords[0].vernacular = "one";
    unfilteredWords[1].senses[0].semanticDomains[0] = mockDomains[1];
    unfilteredWords[1].vernacular = "two";
    unfilteredWords[2].senses[0].semanticDomains[0] = mockDomains[1];
    unfilteredWords[2].vernacular = "three";
    unfilteredWords[3].senses[0].semanticDomains[0] = mockDomains[0];
    unfilteredWords[3].vernacular = "four";

    let expectedValue: Word[] = [unfilteredWords[3]];
    expect(filterWordsByDomain(unfilteredWords, mockDomains[0])).toStrictEqual(
      expectedValue
    );
  });

  it("sorts words alphabetically", () => {
    let mockDomain = mockDomainTree;
    mockDomain.name = "daily";
    let unfilteredWords: Word[] = [
      { ...mockWord },
      { ...mockWord },
      { ...mockWord },
    ];
    let filteredDomainWords: DomainWord[] = [
      { ...mockDomainWord },
      { ...mockDomainWord },
      { ...mockDomainWord },
    ];

    for (let currentWord of unfilteredWords) {
      currentWord.senses[0].semanticDomains[0] = mockDomain;
    }
    unfilteredWords[0].vernacular = "Always";
    unfilteredWords[1].vernacular = "Be";
    unfilteredWords[2].vernacular = "?character";

    filteredDomainWords[0].word = unfilteredWords[0];
    filteredDomainWords[1].word = unfilteredWords[1];
    filteredDomainWords[2].word = unfilteredWords[2];

    let expectedList = [
      filteredDomainWords[2],
      filteredDomainWords[0],
      filteredDomainWords[1],
    ];
    expect(sortDomainWordByVern(unfilteredWords, mockDomain)).toStrictEqual(
      expectedList
    );
  });
});
