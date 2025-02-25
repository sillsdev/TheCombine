import { ReactElement } from "react";
import { Provider } from "react-redux";
import {
  ReactTestInstance,
  ReactTestRenderer,
  act,
  create,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Gloss, SemanticDomain, Sense, Word } from "api/models";
import DataEntryTable, {
  WordAccess,
  addSemanticDomainToSense,
  exitButtonId,
  getSuggestions,
  makeSemDomCurrent,
  maxSuggestions,
  updateEntryGloss,
} from "components/DataEntry/DataEntryTable";
import NewEntry from "components/DataEntry/DataEntryTable/NewEntry";
import { defaultState } from "rootRedux/types";
import { newProject } from "types/project";
import {
  newSemanticDomain,
  newSemanticDomainTreeNode,
  semDomFromTreeNode,
} from "types/semanticDomain";
import { newUser } from "types/user";
import {
  multiSenseWord,
  newGloss,
  newSense,
  newWord,
  simpleWord,
} from "types/word";
import { Bcp47Code } from "types/writingSystem";
import { firstGlossText } from "utilities/wordUtilities";

jest.mock("@mui/material/Autocomplete", () => "div");
jest.mock("notistack", () => ({
  ...jest.requireActual("notistack"),
  enqueueSnackbar: jest.fn(),
}));

jest.mock("backend", () => ({
  createWord: (...args: any[]) => mockCreateWord(...args),
  deleteFrontierWord: jest.fn(),
  getDuplicateId: (...args: any[]) => mockGetDuplicateId(...args),
  getFrontierWords: (...args: any[]) => mockGetFrontierWords(...args),
  getProject: (...args: any[]) => mockGetProject(...args),
  getWord: (...args: any[]) => mockGetWord(...args),
  updateDuplicate: (...args: any[]) => mockUpdateDuplicate(...args),
  updateWord: (...args: any[]) => mockUpdateWord(...args),
}));
jest.mock("backend/localStorage", () => ({
  getCurrentUser: () => mockUser,
  getUserId: () => mockUserId,
}));
jest.mock("components/DataEntry/DataEntryTable/NewEntry/VernDialog");
jest.mock(
  "components/DataEntry/DataEntryTable/RecentEntry",
  () => MockRecentEntry
);
jest.mock("components/Project/ProjectActions", () => ({}));
jest.mock("components/Pronunciations/PronunciationsFrontend", () => "div");

jest.spyOn(window, "alert").mockImplementation(() => {});

let testRenderer: ReactTestRenderer;
let testHandle: ReactTestInstance;

function MockRecentEntry(): ReactElement {
  return <div />;
}

const mockWord = (): Word => simpleWord("mockVern", "mockGloss");
const mockMultiWord = multiSenseWord("vern", ["gloss1", "gloss2"]);
const mockSemDomId = "semDomId";
const mockTreeNode = newSemanticDomainTreeNode(mockSemDomId);
const mockSemDom = semDomFromTreeNode(mockTreeNode);
const mockUser = newUser();
const mockUserId = "mockUserId";
const mockStore = configureMockStore()(defaultState);

const mockCreateWord = jest.fn();
const mockGetDuplicateId = jest.fn();
const mockGetFrontierWords = jest.fn();
const mockGetProject = jest.fn();
const mockGetWord = jest.fn();
const mockHideQuestions = jest.fn();
const mockOpenTree = jest.fn();
const mockUpdateDuplicate = jest.fn();
const mockUpdateWord = jest.fn();

function setMocks(): void {
  mockCreateWord.mockResolvedValue(mockWord());
  mockGetFrontierWords.mockResolvedValue([mockMultiWord]);
  mockGetProject.mockResolvedValue(newProject());
  mockGetWord.mockResolvedValue(mockMultiWord);
  mockUpdateDuplicate.mockResolvedValue(mockWord());
  mockUpdateWord.mockResolvedValue(mockWord());
}

beforeEach(() => {
  jest.clearAllMocks();
  setMocks();
});

const renderTable = async (): Promise<void> => {
  await act(async () => {
    testRenderer = create(
      <Provider store={mockStore}>
        <DataEntryTable
          semanticDomain={mockTreeNode}
          openTree={mockOpenTree}
          hideQuestions={mockHideQuestions}
          showExistingData={jest.fn()}
          updateHeight={jest.fn()}
        />
      </Provider>
    );
  });
};

const addRecentEntry = async (word?: Word): Promise<string> => {
  word ??= mockWord();
  if (!word.senses[0].semanticDomains.length) {
    word.senses[0].semanticDomains.push(mockSemDom);
  }
  mockCreateWord.mockResolvedValueOnce(word);
  mockGetWord.mockResolvedValueOnce(word);
  await act(async () => {
    await testRenderer.root.findByType(NewEntry).props.addNewEntry();
  });
  return word.id;
};

describe("DataEntryTable", () => {
  describe("initial render", () => {
    beforeEach(async () => await renderTable());

    it("gets frontier word", () => {
      expect(mockGetFrontierWords).toHaveBeenCalledTimes(1);
    });
  });

  describe("exit button", () => {
    beforeEach(async () => await renderTable());

    it("hides questions", async () => {
      expect(mockHideQuestions).not.toHaveBeenCalled();
      testHandle = testRenderer.root.findByProps({ id: exitButtonId });
      await act(async () => await testHandle.props.onClick());
      expect(mockHideQuestions).toHaveBeenCalled();
    });

    it("creates word when new entry has vernacular", async () => {
      expect(mockCreateWord).not.toHaveBeenCalled();
      testHandle = testRenderer.root.findByType(NewEntry);
      // Set newVern but not newGloss.
      await act(async () => testHandle.props.setNewVern("hasVern"));
      testHandle = testRenderer.root.findByProps({ id: exitButtonId });
      await act(async () => await testHandle.props.onClick());
      expect(mockCreateWord).toHaveBeenCalledTimes(1);
    });

    it("doesn't create word when new entry has no vernacular", async () => {
      testHandle = testRenderer.root.findByType(NewEntry);
      // Set newGloss but not newVern.
      await act(async () => testHandle.props.setNewGloss("hasGloss"));
      testHandle = testRenderer.root.findByProps({ id: exitButtonId });
      await act(async () => await testHandle.props.onClick());
      expect(mockCreateWord).not.toHaveBeenCalled();
    });

    it("opens the domain tree", async () => {
      expect(mockOpenTree).not.toHaveBeenCalled();
      testHandle = testRenderer.root.findByProps({ id: exitButtonId });
      await act(async () => await testHandle.props.onClick());
      expect(mockOpenTree).toHaveBeenCalledTimes(1);
    });
  });

  describe("addSemanticDomainToSense", () => {
    it("throws error when word doesn't have sense with specified guid", () => {
      expect(() =>
        addSemanticDomainToSense(newSemanticDomain(), mockWord(), "gibberish")
      ).toThrow();
    });

    it("adds a semantic domain to existing sense", () => {
      const word = mockWord();
      const gloss = "senseToBeModified";
      const language = Bcp47Code.Fr;
      const sense = newSense(gloss, language);
      word.senses = [sense];

      const semDom = makeSemDomCurrent(mockSemDom);
      semDom.created = expect.any(String);
      const expectedSense: Sense = { ...sense, semanticDomains: [semDom] };
      const expectedWord: Word = { ...word, senses: [expectedSense] };

      const resultWord = addSemanticDomainToSense(mockSemDom, word, sense.guid);
      expect(resultWord).toEqual(expectedWord);
    });
  });

  describe("getSuggestions", () => {
    it("deals with an empty string", () => {
      expect(getSuggestions("", ["a"], jest.fn())).toHaveLength(0);
    });

    it("deals with an empty array", () => {
      expect(getSuggestions("a", [], jest.fn())).toHaveLength(0);
    });

    it("gives suggestions that begin with the string, shortest first", () => {
      const all = ["abcd", "abc", "abcde", "ab"];
      const expected = ["ab", "abc", "abcd", "abcde"];
      expect(getSuggestions("a", all, jest.fn())).toEqual(expected);
    });

    it("returns at most maxSuggestions suggestions", () => {
      const all = ["aa", "ab", "ac", "ad", "ae", "af", "ag", "ah"];
      expect(all.length).toBeGreaterThan(maxSuggestions);
      expect(getSuggestions("a", all, jest.fn())).toHaveLength(maxSuggestions);
    });

    it("fills up suggestions with other that don't start with the string", () => {
      const noA = ["b", "c", "d", "e", "f", "g", "h"];
      expect(noA.length).toBeGreaterThanOrEqual(maxSuggestions);
      expect(getSuggestions("a", noA, () => 0)).toHaveLength(maxSuggestions);
    });
  });

  describe("makeSemDomCurrent", () => {
    it("adds timestamp and the current user", () => {
      expect(mockSemDom.created).toBeUndefined();
      expect(mockSemDom.userId).toBeUndefined();

      const currentDom = makeSemDomCurrent(mockSemDom);
      expect(currentDom.created).not.toBeUndefined();
      expect(currentDom.userId).toEqual(mockUserId);
    });
  });

  describe("updateEntryGloss", () => {
    it("throws error when entry doesn't have sense with specified guid", () => {
      const entry: WordAccess = {
        isNew: true,
        senseGuid: "gibberish",
        word: newWord(),
      };
      expect(() => updateEntryGloss(entry, "def", "semDomId", "en")).toThrow();
    });

    it("directly updates a sense with no other semantic domains", () => {
      const senseIndex = 1;
      const sense = mockMultiWord.senses[senseIndex];
      sense.semanticDomains = [mockSemDom];
      const entry: WordAccess = {
        isNew: false,
        senseGuid: sense.guid,
        word: mockMultiWord,
      };
      const def = "newGlossDef";

      const expectedGloss: Gloss = { ...sense.glosses[0], def };
      const expectedWord: Word = { ...entry.word };
      expectedWord.senses[senseIndex] = { ...sense, glosses: [expectedGloss] };

      expect(
        updateEntryGloss(entry, def, mockSemDom.id, sense.glosses[0].language)
      ).toEqual(expectedWord);
    });

    it("updates gloss of specified language", () => {
      const senseIndex = 1;
      const sense: Sense = { ...mockMultiWord.senses[senseIndex] };
      const targetGloss = newGloss("target language", "tl");
      sense.glosses = [...sense.glosses, targetGloss];
      sense.semanticDomains = [mockSemDom];
      const entry: WordAccess = {
        isNew: false,
        senseGuid: sense.guid,
        word: mockMultiWord,
      };
      const def = "newGlossDef";

      const expectedGloss: Gloss = { ...targetGloss, def };
      const expectedWord: Word = { ...entry.word };
      expectedWord.senses[senseIndex] = {
        ...sense,
        glosses: [sense.glosses[0], expectedGloss],
      };

      expect(
        updateEntryGloss(entry, def, mockSemDom.id, targetGloss.language)
      ).toEqual(expectedWord);
    });

    it("splits a sense with multiple semantic domains", () => {
      const word = mockWord();
      const sense = word.senses[0];
      const otherDomain: SemanticDomain = { ...mockSemDom, id: "otherId" };
      sense.semanticDomains = [otherDomain, mockSemDom];
      const entry: WordAccess = { isNew: false, senseGuid: sense.guid, word };
      const def = "newGlossDef";

      const oldSense: Sense = { ...sense, semanticDomains: [otherDomain] };
      const newSense: Sense = { ...sense };
      newSense.glosses = [{ ...sense.glosses[0], def }];
      newSense.guid = expect.any(String);
      newSense.semanticDomains = [mockSemDom];
      const expectedWord: Word = { ...word, senses: [oldSense, newSense] };

      expect(
        updateEntryGloss(entry, def, mockSemDom.id, sense.glosses[0].language)
      ).toEqual(expectedWord);
    });
  });

  describe("updateWordWithNewGloss", () => {
    const changeSemDoms = (
      word: Word,
      semanticDomains: SemanticDomain[]
    ): Word => {
      const senses = [...word.senses];
      senses[0] = { ...senses[0], semanticDomains };
      return { ...word, senses };
    };

    it("throws error if no selected dup", async () => {
      await renderTable();
      testHandle = testRenderer.root.findByType(NewEntry);
      await expect(
        async () => await testHandle.props.updateWordWithNewGloss()
      ).rejects.toThrow();
    });

    it("doesn't update word in backend if sense is a duplicate", async () => {
      const word = changeSemDoms(mockMultiWord, [
        newSemanticDomain("someSemDomId"),
        newSemanticDomain(mockSemDomId),
      ]);
      mockGetFrontierWords.mockResolvedValue([word]);
      await renderTable();
      testHandle = testRenderer.root.findByType(NewEntry);
      await act(async () => {
        await testHandle.props.setNewVern(word.vernacular);
        await testHandle.props.setSelectedDup(word.id);
        await testHandle.props.setNewGloss(firstGlossText(word.senses[0]));
        await testHandle.props.updateWordWithNewGloss();
      });
      expect(mockUpdateWord).not.toHaveBeenCalled();
    });

    it("updates word in backend if gloss exists with different semantic domain", async () => {
      const word = changeSemDoms(mockMultiWord, [
        newSemanticDomain("someSemDomId"),
        newSemanticDomain("anotherSemDomId"),
        newSemanticDomain("andAThird"),
      ]);
      mockGetFrontierWords.mockResolvedValue([word]);
      await renderTable();
      const senseIndex = 0;

      testHandle = testRenderer.root.findByType(NewEntry);
      const glossText = firstGlossText(word.senses[senseIndex]);
      await act(async () => {
        await testHandle.props.setNewVern(word.vernacular);
        await testHandle.props.setSelectedDup(word.id);
        await testHandle.props.setNewGloss(glossText);
        await testHandle.props.updateWordWithNewGloss();
      });
      expect(mockUpdateWord).toHaveBeenCalledTimes(1);

      // Confirm the semantic domain was added.
      const wordUpdated: Word = mockUpdateWord.mock.calls[0][0];
      const semDoms = wordUpdated.senses[senseIndex].semanticDomains;
      const semDomAdded = semDoms.find((d) => d.id === mockSemDomId);
      expect(semDomAdded?.created).toBeTruthy();
      expect(semDomAdded?.id).toEqual(mockSemDomId);
      expect(semDomAdded?.userId).toEqual(mockUserId);
    });

    it("updates word in backend if gloss doesn't exist", async () => {
      mockGetFrontierWords.mockResolvedValue([mockMultiWord]);
      await renderTable();
      testHandle = testRenderer.root.findByType(NewEntry);
      await act(async () => {
        await testHandle.props.setNewVern(mockMultiWord.vernacular);
        await testHandle.props.setSelectedDup(mockMultiWord.id);
        await testHandle.props.setNewGloss("differentGloss");
        await testHandle.props.updateWordWithNewGloss();
      });
      expect(mockUpdateWord).toHaveBeenCalledTimes(1);
    });

    describe("with selected sense", () => {
      it("throws error if selected sense not in dup", async () => {
        mockGetFrontierWords.mockResolvedValue([mockMultiWord]);
        await renderTable();
        testHandle = testRenderer.root.findByType(NewEntry);
        await act(async () => {
          await testHandle.props.setNewVern(mockMultiWord.vernacular);
          await testHandle.props.setSelectedDup(mockMultiWord.id);
          await testHandle.props.setSelectedSense("non-existent-guid");
        });
        await expect(
          async () => await testHandle.props.updateWordWithNewGloss()
        ).rejects.toThrow();
      });

      it("updates word if selected sense has empty gloss", async () => {
        const word = changeSemDoms(mockMultiWord, [
          newSemanticDomain("someSemDomId"),
          newSemanticDomain(mockSemDomId),
        ]);
        word.senses[0].glosses[0].def = "";
        mockGetFrontierWords.mockResolvedValue([word]);
        await renderTable();
        testHandle = testRenderer.root.findByType(NewEntry);
        await act(async () => {
          await testHandle.props.setNewVern(word.vernacular);
          await testHandle.props.setSelectedDup(word.id);
          await testHandle.props.setSelectedSense(word.senses[0].guid);
          await testHandle.props.setNewGloss("new gloss");
          await testHandle.props.updateWordWithNewGloss();
        });
        expect(mockUpdateWord).toHaveBeenCalledTimes(1);
      });

      it("doesn't update word if selected sense has domain", async () => {
        const word = changeSemDoms(mockMultiWord, [
          newSemanticDomain("someSemDomId"),
          newSemanticDomain(mockSemDomId),
        ]);
        mockGetFrontierWords.mockResolvedValue([word]);
        await renderTable();
        testHandle = testRenderer.root.findByType(NewEntry);
        await act(async () => {
          await testHandle.props.setNewVern(word.vernacular);
          await testHandle.props.setSelectedDup(word.id);
          await testHandle.props.setSelectedSense(word.senses[0].guid);
          await testHandle.props.setNewGloss(firstGlossText(word.senses[0]));
          await testHandle.props.updateWordWithNewGloss();
        });
        expect(mockUpdateWord).not.toHaveBeenCalled();
      });

      it("updates word if selected sense has different semantic domain", async () => {
        const word = changeSemDoms(mockMultiWord, [
          newSemanticDomain("someSemDomId"),
          newSemanticDomain("anotherSemDomId"),
        ]);
        mockGetFrontierWords.mockResolvedValue([word]);
        await renderTable();

        testHandle = testRenderer.root.findByType(NewEntry);
        await act(async () => {
          await testHandle.props.setNewVern(word.vernacular);
          await testHandle.props.setSelectedDup(word.id);
          await testHandle.props.setSelectedSense(word.senses[0].guid);
          await testHandle.props.setNewGloss(firstGlossText(word.senses[0]));
          await testHandle.props.updateWordWithNewGloss();
        });
        expect(mockUpdateWord).toHaveBeenCalledTimes(1);

        // Confirm the semantic domain was added.
        const wordUpdated: Word = mockUpdateWord.mock.calls[0][0];
        const doms = wordUpdated.senses[0].semanticDomains;
        expect(doms.some((d) => d.id === mockSemDomId)).toBeTruthy();
      });
    });
  });

  describe("addNewWord", () => {
    beforeEach(async () => await renderTable());

    it("checks for duplicate and, if so, updates it", async () => {
      testHandle = testRenderer.root.findByType(NewEntry);
      mockGetDuplicateId.mockResolvedValueOnce(true);
      await act(async () => {
        await testHandle.props.addNewEntry();
      });
      expect(mockUpdateDuplicate).toHaveBeenCalledTimes(1);
      expect(mockCreateWord).not.toHaveBeenCalled();
    });

    it("adds updated duplicate senses to recent entries", async () => {
      // Create word with specified number of senses that have mockSemDom in semanticDomains
      const word = mockWord();
      const semDomSenseCount = 3;
      for (let i = 0; i < semDomSenseCount; i++) {
        word.senses.push({
          ...newSense(`sense${i}`),
          semanticDomains: [mockSemDom],
        });
      }

      // Setup the test scenario
      mockGetDuplicateId.mockResolvedValueOnce(true);
      mockGetWord.mockResolvedValueOnce(word);

      // Verify that the number of recent entries increases by the correct amount
      expect(testRenderer.root.findAllByType(MockRecentEntry)).toHaveLength(0);
      await act(async () => {
        await testRenderer.root.findByType(NewEntry).props.addNewEntry();
      });
      expect(testRenderer.root.findAllByType(MockRecentEntry)).toHaveLength(
        semDomSenseCount
      );
    });

    it("adds with state's vern, gloss, note and with correct semantic domain", async () => {
      testHandle = testRenderer.root.findByType(NewEntry);

      // Set the component's state
      const vern = "vern";
      const glossDef = "gloss";
      const noteText = "note";
      await act(async () => {
        testHandle.props.setNewVern(vern);
        testHandle.props.setNewGloss(glossDef);
        testHandle.props.setNewNote(noteText);
      });

      // Trigger the function to add a new entry
      await act(async () => {
        try {
          await testHandle.props.addNewEntry();
        } catch {
          // Allow for errors after createWord() is called.
        }
      });

      // Verify that createWord() was called with a word with the correct values
      expect(mockCreateWord).toHaveBeenCalledTimes(1);
      const wordAdded: Word = mockCreateWord.mock.calls[0][0];
      expect(wordAdded.vernacular).toEqual(vern);
      expect(wordAdded.senses[0].glosses[0].def).toEqual(glossDef);
      expect(wordAdded.note.text).toEqual(noteText);

      // Verify that the semantic domain is correctly filled
      const semDomAdded = wordAdded.senses[0].semanticDomains[0];
      expect(semDomAdded.created).toBeTruthy();
      expect(semDomAdded.id).toEqual(mockSemDomId);
      expect(semDomAdded.userId).toEqual(mockUserId);
    });

    it("adds added word to recent entries", async () => {
      expect(testRenderer.root.findAllByType(MockRecentEntry)).toHaveLength(0);
      const wordId = await addRecentEntry();
      const recentEntry = testRenderer.root.findByType(MockRecentEntry);
      expect(recentEntry.props.entry.id).toEqual(wordId);
    });
  });

  describe("undoRecentEntry", () => {
    beforeEach(async () => await renderTable());

    it("removes a recent entry", async () => {
      await addRecentEntry();
      const recentEntry = testRenderer.root.findByType(MockRecentEntry);
      await act(async () => {
        await recentEntry.props.removeEntry(recentEntry.props.rowIndex);
      });
      expect(testRenderer.root.findAllByType(MockRecentEntry)).toHaveLength(0);
    });
  });

  describe("updateRecentVern", () => {
    beforeEach(async () => await renderTable());

    it("changes the recent entry's vernacular", async () => {
      // Setup the scenario
      const wordId = await addRecentEntry();
      const recentEntry = testRenderer.root.findByType(MockRecentEntry);

      // Verify that the setup meets the intended conditions within updateRecentVern
      const senses: Sense[] = recentEntry.props.entry.senses;
      expect(senses).toHaveLength(1);
      expect(senses[0].semanticDomains).toHaveLength(1);
      expect(mockUpdateWord).toHaveBeenCalledTimes(0);

      // Update the vernacular
      const newVern = "not the vern generated in addRecentEntry";
      await act(async () => {
        await recentEntry.props.updateVern(recentEntry.props.rowIndex, newVern);
      });

      // Confirm the backend update was correctly called
      expect(mockUpdateWord).toHaveBeenCalledTimes(1);
      const calledWith: Word = mockUpdateWord.mock.calls[0][0];
      expect(calledWith.id).toEqual(wordId);
      expect(calledWith.vernacular).toEqual(newVern);
    });
  });
});
