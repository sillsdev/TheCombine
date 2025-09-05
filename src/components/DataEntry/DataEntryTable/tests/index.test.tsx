import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import "@testing-library/jest-dom";
import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { v4 } from "uuid";

import { Gloss, SemanticDomain, Sense, Word } from "api/models";
import DataEntryTable, {
  DataEntryTableTextId,
  WordAccess,
  addSemanticDomainToSense,
  getSuggestions,
  makeSemDomCurrent,
  maxSuggestions,
  updateEntryGloss,
} from "components/DataEntry/DataEntryTable";
import { NewEntryId } from "components/DataEntry/DataEntryTable/NewEntry";
import { RecentEntryIdPrefix } from "components/DataEntry/DataEntryTable/RecentEntry";
import { defaultState } from "rootRedux/types";
import { newProject } from "types/project";
import {
  newSemanticDomain,
  newSemanticDomainTreeNode,
  semDomFromTreeNode,
} from "types/semanticDomain";
import theme from "types/theme";
import { newUser } from "types/user";
import {
  multiSenseWord,
  newGloss,
  newSense,
  newWord,
  simpleWord,
} from "types/word";
import { Bcp47Code } from "types/writingSystem";

jest.mock("backend", () => ({
  createWord: (word: Word) => mockCreateWord(word),
  deleteFrontierWord: (wordId: string) => mockDeleteFrontierWord(wordId),
  getDuplicateId: (...args: any[]) => mockGetDuplicateId(...args),
  getFrontierWords: () => mockGetFrontierWords(),
  getProject: (...args: any[]) => mockGetProject(...args),
  getWord: (wordId: string) => mockGetWord(wordId),
  updateDuplicate: (...args: any[]) => mockUpdateDuplicate(...args),
  updateWord: (word: Word) => mockUpdateWord(word),
}));
jest.mock("backend/localStorage", () => ({
  getCurrentUser: () => mockUser,
  getUserId: () => mockUserId,
}));
jest.mock("components/DataEntry/utilities.ts", () => ({
  ...jest.requireActual("components/DataEntry/utilities.ts"),
  focusInput: jest.fn(),
}));
jest.mock("components/Pronunciations/PronunciationsFrontend", () => jest.fn());
jest.mock("i18n", () => ({})); // else `thrown: "Error: AggregateError`

jest.spyOn(window, "alert").mockImplementation(() => {});

const mockVern = "vern";
const mockGloss = "gloss";
const mockWord = (): Word => simpleWord(mockVern, mockGloss);
const mockMultiGloss = ["gloss1", "gloss2", ""];
const mockSemDomId = "semDomId";
const mockTreeNode = newSemanticDomainTreeNode(mockSemDomId);
const mockSemDom = semDomFromTreeNode(mockTreeNode);
const mockMultiWord = (): Word => {
  const word = multiSenseWord(mockVern, mockMultiGloss);
  word.senses[1].semanticDomains = [mockSemDom];
  return word;
};
const mockUser = newUser();
const mockUserId = "mockUserId";
const mockStore = configureMockStore()(defaultState);

const mockCreateWord = jest.fn();
const mockDeleteFrontierWord = jest.fn();
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
  mockGetFrontierWords.mockResolvedValue([mockMultiWord()]);
  mockGetProject.mockResolvedValue(newProject());
  mockGetWord.mockResolvedValue(mockMultiWord());
  mockUpdateDuplicate.mockResolvedValue(mockWord());
  mockUpdateWord.mockResolvedValue(mockWord());
}

jest.setTimeout(10000);

let agent: UserEvent;

beforeEach(() => {
  jest.clearAllMocks();
  setMocks();
  agent = userEvent.setup();
});

const renderTable = async (): Promise<void> => {
  await act(async () => {
    render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <DataEntryTable
              semanticDomain={mockTreeNode}
              openTree={mockOpenTree}
              hideQuestions={mockHideQuestions}
              showExistingData={jest.fn()}
              updateHeight={jest.fn()}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
};

const typeNewVernAndGloss = async (
  vern?: string,
  gloss?: string
): Promise<void> => {
  const newEntry = screen.getAllByRole("row").pop()!;
  const [vernField, glossField] = within(newEntry).getAllByRole("combobox");
  if (vern) {
    await agent.type(vernField, vern);
  }
  if (gloss) {
    await agent.type(glossField, gloss);
  }
};

const addRecentEntry = async (word?: Word): Promise<Word> => {
  word ??= mockWord();
  if (!word.senses[0].semanticDomains.length) {
    word.senses[0].semanticDomains.push(mockSemDom);
  }
  mockCreateWord.mockResolvedValueOnce(word);
  mockGetWord.mockResolvedValueOnce(word);
  await typeNewVernAndGloss("a", "{enter}"); // Any non-empty vernacular for submit to work.
  return word;
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

    const clickExit = async (): Promise<void> =>
      await agent.click(screen.getByText(DataEntryTableTextId.ButtonExit));

    it("hides questions", async () => {
      expect(mockHideQuestions).not.toHaveBeenCalled();
      await clickExit();
      expect(mockHideQuestions).toHaveBeenCalledTimes(1);
    });

    it("creates word when new entry has vernacular", async () => {
      await typeNewVernAndGloss("hasVern");
      expect(mockCreateWord).not.toHaveBeenCalled();
      await clickExit();
      expect(mockCreateWord).toHaveBeenCalledTimes(1);
    });

    it("doesn't create word when new entry has no vernacular", async () => {
      await typeNewVernAndGloss(undefined, "hasGloss");
      await clickExit();
      expect(mockCreateWord).not.toHaveBeenCalled();
    });

    it("opens the domain tree", async () => {
      expect(mockOpenTree).not.toHaveBeenCalled();
      await clickExit();
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
      const senseIndex = 0;
      const word = mockMultiWord();
      const sense = word.senses[senseIndex];
      sense.semanticDomains = [mockSemDom];
      const entry: WordAccess = { isNew: false, senseGuid: sense.guid, word };
      const def = "newGlossDef";

      const expectedGloss: Gloss = { ...sense.glosses[0], def };
      const expectedSenses: Sense[] = entry.word.senses.map((s) => ({ ...s }));
      expectedSenses[senseIndex] = { ...sense, glosses: [expectedGloss] };

      const updatedSenses = updateEntryGloss(
        entry,
        def,
        mockSemDom.id,
        sense.glosses[0].language
      ).senses;
      expect(updatedSenses).toHaveLength(expectedSenses.length);
      expectedSenses.forEach((es) => {
        expect(updatedSenses.find((us) => us.guid === es.guid)).toEqual(es);
      });
    });

    it("updates gloss of specified language", () => {
      const senseIndex = 0;
      const word = mockMultiWord();
      const sense = word.senses[senseIndex];
      const targetGloss = newGloss("target language", "tl");
      sense.glosses = [...sense.glosses, targetGloss];
      sense.semanticDomains = [mockSemDom];
      const entry: WordAccess = { isNew: false, senseGuid: sense.guid, word };
      const def = "newGlossDef";

      const expectedGloss: Gloss = { ...targetGloss, def };
      const expectedSenses: Sense[] = entry.word.senses.map((s) => ({ ...s }));
      expectedSenses[senseIndex] = {
        ...sense,
        glosses: [sense.glosses[0], expectedGloss],
      };

      const updatedSenses = updateEntryGloss(
        entry,
        def,
        mockSemDom.id,
        targetGloss.language
      ).senses;
      expect(updatedSenses).toHaveLength(expectedSenses.length);
      expectedSenses.forEach((es) => {
        expect(updatedSenses.find((us) => us.guid === es.guid)).toEqual(es);
      });
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

  describe("with duplicate selected", () => {
    beforeEach(async () => {
      mockUpdateWord.mockImplementation((w: Word) =>
        Promise.resolve({ ...w, id: v4() })
      );
      await renderTable();
    });

    /** With `mockGetFrontierWords.mockResolvedValue([mockMultiWord()])`,
     * use `n` from 0 to 5 for menu items:
     *
     * 0. entry vern (disabled)
     * 1. sense gloss1 (without mockSemDom)
     * 2. sense gloss2 (with mockSemDom)
     * 3. sense with empty gloss
     * 4. new sense
     * 5. new entry */
    const selectVernDialogRow = async (n: number): Promise<void> => {
      await typeNewVernAndGloss(mockVern, "{enter}");
      const dialog = await screen.findByRole("dialog");
      await agent.click(within(dialog).getAllByRole("menuitem")[n]);
      await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
    };

    it("adds semantic domain to selected duplicate sense", async () => {
      await selectVernDialogRow(1);
      expect(mockUpdateWord).not.toHaveBeenCalled();
      await typeNewVernAndGloss(undefined, "{enter}");
      expect(mockUpdateWord).toHaveBeenCalledTimes(1);
      const updatedSense: Sense = mockUpdateWord.mock.calls[0][0].senses[0];
      expect(
        updatedSense.semanticDomains.find((dom) => dom.id === mockSemDom.id)
      ).toBeTruthy();
      expect(mockCreateWord).not.toHaveBeenCalled();
    });

    it("adds sense to duplicate word if sense is selected but gloss is changed", async () => {
      await selectVernDialogRow(1);
      const suffix = " modified";
      expect(mockUpdateWord).not.toHaveBeenCalled();
      await typeNewVernAndGloss(undefined, `${suffix}{enter}`);
      expect(mockUpdateWord).toHaveBeenCalledTimes(1);
      const updatedSenses: Sense[] = mockUpdateWord.mock.calls[0][0].senses;
      expect(updatedSenses).toHaveLength(mockMultiGloss.length + 1);
      const newSense = updatedSenses[mockMultiGloss.length];
      expect(newSense.glosses[0].def).toEqual(`${mockMultiGloss[0]}${suffix}`);
      expect(newSense.semanticDomains).toHaveLength(1);
      expect(newSense.semanticDomains[0].id).toEqual(mockSemDom.id);
      expect(mockCreateWord).not.toHaveBeenCalled();
    });

    it("doesn't adds semantic domain to selected duplicate sense if already has domain", async () => {
      await selectVernDialogRow(2);
      await typeNewVernAndGloss(undefined, "{enter}");
      expect(mockCreateWord).not.toHaveBeenCalled();
      expect(mockUpdateWord).not.toHaveBeenCalled();
    });

    it("updates selected duplicate sense if gloss is empty", async () => {
      await selectVernDialogRow(3);
      const newGloss = "newGloss";
      expect(mockUpdateWord).not.toHaveBeenCalled();
      await typeNewVernAndGloss(undefined, `${newGloss}{enter}`);
      expect(mockUpdateWord).toHaveBeenCalledTimes(1);
      const updatedSenses: Sense[] = mockUpdateWord.mock.calls[0][0].senses;
      expect(updatedSenses).toHaveLength(mockMultiGloss.length);
      const modifiedSense = updatedSenses[2];
      expect(modifiedSense.glosses[0].def).toEqual(newGloss);
      expect(modifiedSense.semanticDomains).toHaveLength(1);
      expect(modifiedSense.semanticDomains[0].id).toEqual(mockSemDom.id);
      expect(mockCreateWord).not.toHaveBeenCalled();
    });

    it("adds sense to duplicate word if new sense is selected", async () => {
      await selectVernDialogRow(4);
      const newGloss = "new gloss";
      expect(mockUpdateWord).not.toHaveBeenCalled();
      await typeNewVernAndGloss(undefined, `${newGloss}{enter}`);
      expect(mockUpdateWord).toHaveBeenCalledTimes(1);
      const updatedSenses: Sense[] = mockUpdateWord.mock.calls[0][0].senses;
      expect(updatedSenses).toHaveLength(mockMultiGloss.length + 1);
      const newSense = updatedSenses[mockMultiGloss.length];
      expect(newSense.glosses[0].def).toEqual(newGloss);
      expect(newSense.semanticDomains).toHaveLength(1);
      expect(newSense.semanticDomains[0].id).toEqual(mockSemDom.id);
      expect(mockCreateWord).not.toHaveBeenCalled();
    });

    it("creates new word if new entry selected", async () => {
      await selectVernDialogRow(5);
      const newGloss = "new gloss";
      expect(mockCreateWord).not.toHaveBeenCalled();
      await typeNewVernAndGloss(undefined, `${newGloss}{enter}`);
      expect(mockCreateWord).toHaveBeenCalledTimes(1);
      const newWord: Word = mockCreateWord.mock.calls[0][0];
      expect(newWord.vernacular).toEqual(mockVern);
      expect(newWord.senses[0].glosses[0].def).toEqual(newGloss);
      expect(mockUpdateWord).not.toHaveBeenCalled();
    });
  });

  describe("addNewWord", () => {
    beforeEach(async () => await renderTable());

    it("checks for duplicate and, if so, updates it", async () => {
      mockGetDuplicateId.mockResolvedValueOnce(true);
      await typeNewVernAndGloss("non-empty", "{enter}");
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
      expect(screen.queryAllByRole("row")).toHaveLength(1);
      await typeNewVernAndGloss("non-empty", "{enter}");
      expect(screen.queryAllByRole("row")).toHaveLength(1 + semDomSenseCount);
    });

    it("adds with state's vern, gloss, note and with correct semantic domain", async () => {
      const newEntry = screen.getAllByRole("row").pop()!;

      // Set the component's state
      const vern = "newVern";
      const glossDef = "newGloss";
      await typeNewVernAndGloss(vern, glossDef);
      expect(within(newEntry).getByDisplayValue(vern)).toBeTruthy();
      expect(within(newEntry).getByDisplayValue(glossDef)).toBeTruthy();

      const noteText = "newNote";
      await agent.click(within(newEntry).getByTestId(NewEntryId.ButtonNote));
      const noteDialog = screen.getByRole("dialog");
      await agent.type(within(noteDialog).getByRole("textbox"), noteText);
      await agent.click(within(noteDialog).getByText("buttons.confirm"));
      await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
      expect(within(newEntry).getByLabelText(noteText)).toBeTruthy();

      // Trigger the function to add a new entry
      await typeNewVernAndGloss(undefined, "{enter}");

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
      expect(screen.getAllByRole("row")).toHaveLength(1);
      const word = await addRecentEntry();
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(2);
      expect(within(rows[0]).getByDisplayValue(word.vernacular)).toBeTruthy();
      expect(
        within(rows[0]).getByDisplayValue(word.senses[0].glosses[0].def)
      ).toBeTruthy();
    });
  });

  describe("undoRecentEntry", () => {
    beforeEach(async () => await renderTable());

    it("removes a recent entry", async () => {
      await addRecentEntry();
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(2);
      await agent.click(
        within(rows[0]).getByTestId(
          new RegExp(RecentEntryIdPrefix.ButtonDelete)
        )
      );
      await agent.click(screen.getByText("buttons.confirm"));
      expect(screen.getAllByRole("row")).toHaveLength(1);
    });
  });

  describe("updateRecent", () => {
    beforeEach(async () => await renderTable());

    it("changes the recent entry's vernacular", async () => {
      // Setup the scenario
      const word = await addRecentEntry();
      expect(mockUpdateWord).not.toHaveBeenCalled();

      // Update the vernacular
      const newVern = "other vern";
      const [vernField, glossField] = within(
        screen.getAllByRole("row")[0]
      ).getAllByRole("combobox");
      await agent.clear(vernField);
      await agent.type(vernField, newVern);
      await agent.click(glossField);

      // Confirm the backend update was correctly called
      expect(mockUpdateWord).toHaveBeenCalledTimes(1);
      const calledWith: Word = mockUpdateWord.mock.calls[0][0];
      expect(calledWith.id).toEqual(word.id);
      expect(calledWith.vernacular).toEqual(newVern);
    });

    it("changes the recent entry's gloss", async () => {
      // Setup the scenario
      const word = await addRecentEntry();
      expect(mockUpdateWord).not.toHaveBeenCalled();

      // Update the gloss
      const newGloss = "other gloss";
      const [vernField, glossField] = within(
        screen.getAllByRole("row")[0]
      ).getAllByRole("combobox");
      await agent.clear(glossField);
      await agent.type(glossField, newGloss);
      await agent.click(vernField);

      // Confirm the backend update was correctly called
      expect(mockUpdateWord).toHaveBeenCalledTimes(1);
      const calledWith: Word = mockUpdateWord.mock.calls[0][0];
      expect(calledWith.id).toEqual(word.id);
      expect(calledWith.senses[0].glosses[0].def).toEqual(newGloss);
    });
  });
});
