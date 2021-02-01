import React from "react";
import { Provider } from "react-redux";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";
import DataEntryTable, {
  addSemanticDomainToSense,
  addSenseToWord,
} from "components/DataEntry/DataEntryTable/DataEntryTable";
import NewEntry from "components/DataEntry/DataEntryTable/NewEntry/NewEntry";
import { defaultProject } from "types/project";
import { baseDomain } from "types/SemanticDomain";
import {
  multiGlossWord,
  SemanticDomain,
  Sense,
  simpleWord,
  State,
  Word,
} from "types/word";

jest.mock("backend", () => {
  return {
    createWord: (word: Word) => mockCreateWord(word),
    getFrontierWords: () => mockGetFrontierWords(),
    getProject: (id: string) => mockGetProject(id),
    getWord: (id: string) => mockGetWord(id),
    updateWord: (word: Word) => mockUpdateWord(word),
  };
});
jest.mock("../../../Pronunciations/Recorder");
jest.mock("../RecentEntry/RecentEntry");
jest.spyOn(window, "alert").mockImplementation(() => {});

let testRenderer: ReactTestRenderer;
let testHandle: ReactTestInstance;

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);
const mockWord = simpleWord("", "");
const mockMultiWord = multiGlossWord("vern", ["gloss1", "gloss2"]);
const mockSemanticDomain: SemanticDomain = {
  name: "",
  id: "",
};
const hideQuestionsMock = jest.fn();
const getWordsFromBackendMock = jest.fn();

const mockCreateWord = jest.fn();
const mockGetFrontierWords = jest.fn();
const mockGetProject = jest.fn();
const mockGetWord = jest.fn();
const mockUpdateWord = jest.fn();
function setMockFunction() {
  mockCreateWord.mockResolvedValue(mockWord);
  mockGetFrontierWords.mockResolvedValue([mockWord]);
  mockGetProject.mockResolvedValue(defaultProject);
  mockGetWord.mockResolvedValue([mockMultiWord]);
  mockUpdateWord.mockResolvedValue(mockWord);
}

beforeEach(() => {
  jest.clearAllMocks();
  setMockFunction();
  getWordsFromBackendMock.mockResolvedValue([mockMultiWord]);
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <DataEntryTable
          domain={baseDomain}
          semanticDomain={mockSemanticDomain}
          displaySemanticDomainView={jest.fn()}
          isSmallScreen={false}
          hideQuestions={hideQuestionsMock}
          getWordsFromBackend={getWordsFromBackendMock}
          showExistingData={jest.fn()}
        />
      </Provider>
    );
  });
});

describe("DataEntryTable", () => {
  it("should call add word on backend when new entry has data and complete is clicked", (done) => {
    // Verify that NewEntry is present
    let newEntryItems = testRenderer.root.findAllByType(NewEntry);
    expect(newEntryItems.length).toBe(1);
    let newEntryWord: Word = simpleWord("hasVern", "");
    testHandle = newEntryItems[0];
    testHandle.instance.setState(
      {
        newEntry: newEntryWord,
      },
      () => {
        // Get button for complete and push it
        testRenderer.root.findByProps({ id: "complete" }).props.onClick();
        // Assert that the backend function for adding the word was called
        expect(mockCreateWord).toBeCalled();
        done();
      }
    );
  });

  it("should NOT call add word on backend when new entry has no vernacular and complete is clicked", (done) => {
    // Verify that NewEntry is present
    let newEntryItems = testRenderer.root.findAllByType(NewEntry);
    expect(newEntryItems.length).toBe(1);
    // set the new entry to have no useful content
    let newEntryWord: Word = simpleWord("", "hasGloss");
    testHandle = newEntryItems[0];
    testHandle.instance.setState(
      {
        newEntry: newEntryWord,
      },
      () => {
        // Get button for complete and push it
        testRenderer.root.findByProps({ id: "complete" }).props.onClick();
        // Assert that the backend function for adding the word was NOT called
        expect(mockCreateWord).not.toBeCalled();
        done();
      }
    );
  });

  it("calls hideQuestions when complete is clicked", () => {
    testRenderer.root.findByProps({ id: "complete" }).props.onClick();
    expect(hideQuestionsMock).toBeCalledTimes(1);
  });

  it("adds a sense to a word that has no senses already", () => {
    let semanticDomain: SemanticDomain = mockSemanticDomain;
    let word: Word = mockWord;
    let gloss = "yeet";
    let newSense: Sense = {
      glosses: [{ language: "en", def: gloss }],
      semanticDomains: [semanticDomain],
      accessibility: State.Active,
    };
    const expectedWord: Word = {
      ...word,
      senses: [...word.senses, newSense],
    };
    expect(addSenseToWord(semanticDomain, word, gloss, "en")).toEqual(
      expectedWord
    );
  });

  it("adds a sense to a word that already has a sense", () => {
    let semanticDomain: SemanticDomain = mockSemanticDomain;
    let existingSense: Sense = {
      glosses: [{ language: "", def: "" }],
      semanticDomains: [{ name: "domain", id: "10.2" }],
    };
    let word: Word = {
      ...mockWord,
      senses: [...mockWord.senses, existingSense],
    };
    let gloss = "yeet";
    let expectedSense: Sense = {
      glosses: [{ language: "en", def: gloss }],
      semanticDomains: [semanticDomain],
      accessibility: State.Active,
    };
    const expectedWord: Word = {
      ...word,
      senses: [...word.senses, expectedSense],
    };
    expect(addSenseToWord(semanticDomain, word, gloss, "en")).toEqual(
      expectedWord
    );
  });

  it("adds a semantic domain to an existing sense", () => {
    let semanticDomain: SemanticDomain = mockSemanticDomain;
    let sense: Sense = {
      glosses: [{ language: "en", def: "yeet" }],
      semanticDomains: [],
      accessibility: State.Active,
    };
    let word: Word = {
      ...mockWord,
      senses: [...mockWord.senses, sense],
    };
    let senseIndex = word.senses.length - 1;
    let expectedWord: Word = {
      ...mockWord,
      senses: [
        ...mockWord.senses,
        {
          ...sense,
          semanticDomains: [semanticDomain],
        },
      ],
    };
    expect(addSemanticDomainToSense(semanticDomain, word, senseIndex)).toEqual(
      expectedWord
    );
  });

  it("doesn't update word in backend if sense is a duplicate", (done) => {
    testHandle = testRenderer.root.findAllByType(DataEntryTable)[0];
    mockMultiWord.senses[0].semanticDomains = [
      { name: "", id: "differentSemDomId" },
      { name: "", id: testHandle.instance.props.semanticDomain.id },
    ];
    testHandle.instance.setState(
      {
        existingWords: [mockMultiWord],
      },
      () => {
        testRenderer.root
          .findByType(NewEntry)
          .props.updateWordWithNewGloss(
            mockMultiWord.id,
            mockMultiWord.senses[0].glosses[0].def,
            []
          )
          .then(() => {
            // Assert that the backend function for updating the word was NOT called
            expect(mockUpdateWord).not.toBeCalled();
            done();
          });
      }
    );
  });

  it("updates word in backend if gloss exists with different semantic domain", (done) => {
    testHandle = testRenderer.root.findAllByType(DataEntryTable)[0];
    mockMultiWord.senses[0].semanticDomains = [
      { name: "", id: "differentSemDomId" },
      { name: "", id: "anotherDifferentSemDomId" },
      { name: "", id: "andAThird" },
    ];
    testHandle.instance.setState(
      {
        existingWords: [mockMultiWord],
      },
      () => {
        testRenderer.root
          .findByType(NewEntry)
          .props.updateWordWithNewGloss(
            mockMultiWord.id,
            mockMultiWord.senses[0].glosses[0].def,
            []
          )
          .then(() => {
            // Assert that the backend function for updating the word was called once
            expect(mockUpdateWord).toBeCalledTimes(1);
            done();
          });
      }
    );
  });

  it("updates word in backend if gloss doesn't exist", (done) => {
    testHandle = testRenderer.root.findAllByType(DataEntryTable)[0];
    testHandle.instance.setState(
      {
        existingWords: [mockMultiWord],
      },
      () => {
        testRenderer.root
          .findByType(NewEntry)
          .props.updateWordWithNewGloss(mockMultiWord.id, "differentGloss", [])
          .then(() => {
            // Assert that the backend function for updating the word was called once
            expect(mockUpdateWord).toBeCalledTimes(1);
            done();
          });
      }
    );
  });
});
