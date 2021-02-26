/*import React from "react";
import { Provider } from "react-redux";
import renderer, { ReactTestInstance } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";*/
import {
  /*DataEntryComponent,*/ filterWords,
  filterWordsByDomain,
  sortDomainWordByVern,
} from "components/DataEntry/DataEntryComponent";
/*import { DataEntryHeader } from "components/DataEntry/DataEntryHeader/DataEntryHeader";
import { DataEntryTable } from "components/DataEntry/DataEntryTable/DataEntryTable";
import { defaultProject } from "types/project";*/
import SemanticDomainWithSubdomains, { baseDomain } from "types/SemanticDomain";
import { DomainWord, Sense, simpleWord, State, Word } from "types/word";

/*jest.mock("@material-ui/core/Dialog");
jest.mock("backend", () => {
  return {
    getFrontierWords: () => mockGetFrontierWords(),
    getProject: () => mockGetProject(),
  };
});
jest.mock("components/AppBar/AppBarComponent"); // ReactTestRenderer doesn't like rendering UserMenu
jest.mock("components/DataEntry/DataEntryTable/NewEntry/NewEntry");
jest.mock("components/Pronunciations/Recorder");
jest.mock("components/TreeView");

const mockNewEntry = jest.fn();
const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);*/
const mockWord = simpleWord("", "");
const mockDomainWord: DomainWord = {
  word: mockWord,
  gloss: mockWord.senses[0].glosses[0],
};

/*const mockGetFrontierWords = jest.fn();
const mockGetProject = jest.fn();
function setMockFunctions() {
  mockGetFrontierWords.mockResolvedValue([]);
  mockGetProject.mockResolvedValue(defaultProject);
  mockWindow();
}

//Needed to mock window until refactored
function mockWindow() {
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
}

function createDataEntryComponentInstance(
  dom: SemanticDomainWithSubdomains
): ReactTestInstance {
  return renderer.create(
    <Provider store={mockStore}>
      <DataEntryComponent domain={dom} />
    </Provider>
  ).root;
}*/

describe("DataEntryComponent", () => {
  /*it("Questions hidden on complete clicked", () => {
    setMockFunctions();
    const newDomain = { ...baseDomain, questions: ["Q1", "Q2", "Q3"] };
    //mockNewEntry.mockReturnValue(React.Fragment);
    const parentInstance = createDataEntryComponentInstance(newDomain);

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
  });*/

  describe("filterWords", () => {
    it("should return empty Word Array when given empty Word Array", () => {
      const words: Word[] = [];
      const expectedWords: Word[] = [];
      expect(filterWords(words)).toEqual(expectedWords);
    });

    it("should filter out words that are inaccessible", () => {
      const words: Word[] = [
        {
          ...mockWord,
          senses: [new Sense()],
        },
      ];
      const expectedWords: Word[] = [];
      expect(filterWords(words)).toEqual(expectedWords);
    });

    it("should not filter words that are accessible", () => {
      const words: Word[] = [
        {
          ...mockWord,
          senses: [{ ...new Sense(), accessibility: State.Active }],
        },
      ];
      const expectedWords: Word[] = [...words];
      expect(filterWords(words)).toEqual(expectedWords);
    });
  });

  it("filterWordsByDomain filters out words that do not match desired domain", () => {
    const mockDomains: SemanticDomainWithSubdomains[] = [
      { ...baseDomain },
      { ...baseDomain },
    ];

    mockDomains[0].name = "daily";
    mockDomains[0].id = "ID_one";
    mockDomains[1].name = "weather";
    mockDomains[1].id = "ID_two";

    const sense: Sense[] = [
      { ...new Sense("", "", mockDomains[0]), accessibility: State.Active },
      { ...new Sense("", "", mockDomains[1]), accessibility: State.Active },
    ];

    const unfilteredWords: Word[] = [
      {
        ...mockWord,
        vernacular: "one",
        senses: [...mockWord.senses, sense[0]],
      },
      {
        ...mockWord,
        vernacular: "two",
        senses: [...mockWord.senses, sense[1]],
      },
      {
        ...mockWord,
        vernacular: "three",
        senses: [...mockWord.senses, sense[0]],
      },
    ];

    const domainWords: DomainWord[] = [];
    const curDomainWord: DomainWord = {
      word: unfilteredWords[1],
      gloss: unfilteredWords[1].senses[0].glosses[0],
    };
    domainWords.push(curDomainWord);
    expect(filterWordsByDomain(unfilteredWords, mockDomains[1])).toStrictEqual(
      domainWords
    );
  });

  it("sortDomainWordByVern sorts words alphabetically", () => {
    const mockDomain = baseDomain;
    mockDomain.name = "daily";
    const unfilteredWords: Word[] = [
      { ...mockWord },
      { ...mockWord },
      { ...mockWord },
    ];
    const filteredDomainWords: DomainWord[] = [
      { ...mockDomainWord },
      { ...mockDomainWord },
      { ...mockDomainWord },
    ];

    for (const currentWord of unfilteredWords) {
      currentWord.senses[0].semanticDomains[0] = mockDomain;
    }
    unfilteredWords[0].vernacular = "Always";
    unfilteredWords[1].vernacular = "Be";
    unfilteredWords[2].vernacular = "?character";

    filteredDomainWords[0].word = unfilteredWords[0];
    filteredDomainWords[1].word = unfilteredWords[1];
    filteredDomainWords[2].word = unfilteredWords[2];

    const expectedList = [
      filteredDomainWords[2],
      filteredDomainWords[0],
      filteredDomainWords[1],
    ];
    expect(sortDomainWordByVern(unfilteredWords, mockDomain)).toStrictEqual(
      expectedList
    );
  });
});
