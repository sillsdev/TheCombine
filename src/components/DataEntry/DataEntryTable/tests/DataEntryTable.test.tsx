import { Provider } from "react-redux";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Sense, Word } from "api/models";
import { defaultState } from "components/App/DefaultState";
import DataEntryTable, {
  addSemanticDomainToSense,
  addSenseToWord,
} from "components/DataEntry/DataEntryTable/DataEntryTable";
import NewEntry from "components/DataEntry/DataEntryTable/NewEntry/NewEntry";
import { newProject } from "types/project";
import {
  multiSenseWord,
  newSemanticDomain,
  newSense,
  simpleWord,
} from "types/word";

jest.mock("backend", () => {
  return {
    createWord: (word: Word) => mockCreateWord(word),
    getProject: (id: string) => mockGetProject(id),
    getWord: (id: string) => mockGetWord(id),
    updateWord: (word: Word) => mockUpdateWord(word),
  };
});
jest.mock("components/DataEntry/DataEntryTable/RecentEntry/RecentEntry");
jest.mock("components/Pronunciations/Recorder");
jest.spyOn(window, "alert").mockImplementation(() => {});

let testRenderer: ReactTestRenderer;
let testHandle: ReactTestInstance;

const createMockStore = configureMockStore();
const mockStore = createMockStore(defaultState);
const mockWord = () => simpleWord("mockVern", "mockGloss");
const mockMultiWord = multiSenseWord("vern", ["gloss1", "gloss2"]);
const mockSemanticDomain = newSemanticDomain();
const hideQuestionsMock = jest.fn();
const getWordsFromBackendMock = jest.fn();

const mockCreateWord = jest.fn();
const mockGetProject = jest.fn();
const mockGetWord = jest.fn();
const mockUpdateWord = jest.fn();
function setMockFunction() {
  mockCreateWord.mockResolvedValue(mockWord());
  mockGetProject.mockResolvedValue(newProject());
  mockGetWord.mockResolvedValue([mockMultiWord]);
  mockUpdateWord.mockResolvedValue(mockWord());
}

beforeEach(() => {
  jest.clearAllMocks();
  setMockFunction();
  getWordsFromBackendMock.mockResolvedValue([mockMultiWord]);
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <DataEntryTable
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

  it("adds a sense to a word that has no senses", () => {
    const word = mockWord();
    word.senses = [];
    const gloss = "firstSense";
    const language = "es";

    const expectedSense = newSense(gloss, language, mockSemanticDomain);
    expectedSense.guid = expect.any(String);
    const expectedWord: Word = {
      ...word,
      senses: [expectedSense],
    };

    const resultWord = addSenseToWord(
      mockSemanticDomain,
      word,
      gloss,
      language
    );
    expect(resultWord).toEqual(expectedWord);
  });

  it("adds a sense to a word that already has a sense", () => {
    const word = mockWord();
    const gloss = "newSense";
    const language = "es";

    const expectedSense = newSense(gloss, language, mockSemanticDomain);
    expectedSense.guid = expect.any(String);
    const expectedWord: Word = {
      ...word,
      senses: [...word.senses, expectedSense],
    };

    const resultWord = addSenseToWord(
      mockSemanticDomain,
      word,
      gloss,
      language
    );
    expect(resultWord).toEqual(expectedWord);
  });

  it("adds a semantic domain to existing sense", () => {
    const word = mockWord();
    const gloss = "senseToBeModified";
    const language = "fr";
    const sense = newSense(gloss, language);
    word.senses = [sense];

    const expectedSense: Sense = {
      ...sense,
      semanticDomains: [mockSemanticDomain],
    };
    const expectedWord: Word = {
      ...word,
      senses: [expectedSense],
    };

    const resultWord = addSemanticDomainToSense(mockSemanticDomain, word, 0);
    expect(resultWord).toEqual(expectedWord);
  });

  it("doesn't update word in backend if sense is a duplicate", (done) => {
    testHandle = testRenderer.root.findAllByType(DataEntryTable)[0];
    mockMultiWord.senses[0].semanticDomains = [
      newSemanticDomain("differentSemDomId"),
      newSemanticDomain(testHandle.instance.props.semanticDomain.id),
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
      newSemanticDomain("differentSemDomId"),
      newSemanticDomain("anotherDifferentSemDomId"),
      newSemanticDomain("andAThird"),
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
