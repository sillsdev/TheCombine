import { PreloadedState } from "redux";

import { Sense, Word } from "api/models";
import { defaultState } from "components/App/DefaultState";
import {
  deleteWord,
  getSenseError,
  getSenseFromEditSense,
  resetReviewEntries,
  setAllWords,
  setSortBy,
  updateFrontierWord,
  updateWord,
} from "goals/ReviewEntries/Redux/ReviewEntriesActions";
import {
  ColumnId,
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesTypes";
import { RootState, setupStore } from "store";
import { newSemanticDomain } from "types/semanticDomain";
import { newFlag, newGloss, newNote, newSense, newWord } from "types/word";
import { Bcp47Code } from "types/writingSystem";

const mockGetWord = jest.fn();
const mockUpdateWord = jest.fn();
function mockGetWordResolve(data: Word): void {
  mockGetWord.mockResolvedValue(JSON.parse(JSON.stringify(data)));
}

jest.mock("backend", () => ({
  deleteAudio: () => jest.fn(),
  getWord: (wordId: string) => mockGetWord(wordId),
  updateWord: (word: Word) => mockUpdateWord(word),
  uploadAudio: () => jest.fn(),
}));
jest.mock("components/GoalTimeline/Redux/GoalActions", () => ({
  addEntryEditToGoal: () => jest.fn(),
  asyncUpdateGoal: () => jest.fn(),
}));

// Dummy strings, glosses, and domains.
const commonGuid = "mockGuid";
const gloss0 = newGloss("gloss", Bcp47Code.En);
const gloss0Es = newGloss("glossario", Bcp47Code.Es);
const gloss1 = newGloss("infinite", Bcp47Code.En);
const domain0 = newSemanticDomain("1", "Universe");
const domain1 = newSemanticDomain("8.3.3.2.1", "Shadow");
const colId = ColumnId.Definitions;
const wordId = "mockId";

// Dummy sense and word creators.
function sense0(): Sense {
  return {
    ...newSense(),
    guid: commonGuid + "0",
    glosses: [{ ...gloss0 }, { ...gloss0Es }],
    semanticDomains: [{ ...domain0 }],
  };
}
function sense1(): Sense {
  return {
    ...newSense(),
    guid: commonGuid + "1",
    glosses: [{ ...gloss1 }],
    semanticDomains: [{ ...domain1 }],
  };
}
function sense1_local(): ReviewEntriesSense {
  return new ReviewEntriesSense(sense1());
}
function mockFrontierWord(vernacular = "word"): Word {
  return {
    ...newWord(vernacular),
    guid: commonGuid,
    id: wordId,
    senses: [sense0()],
  };
}
function mockReviewEntriesWord(vernacular = "word"): ReviewEntriesWord {
  return {
    ...new ReviewEntriesWord(),
    id: wordId,
    vernacular,
    senses: [new ReviewEntriesSense(sense0())],
  };
}

// Preloaded values for store when testing
const persistedDefaultState: PreloadedState<RootState> = {
  ...defaultState,
  _persist: { version: 1, rehydrated: false },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ReviewEntriesActions", () => {
  describe("Action Creation Functions", () => {
    test("deleteWord", () => {
      const store = setupStore({
        ...persistedDefaultState,
        reviewEntriesState: {
          sortBy: colId,
          words: [mockFrontierWord()],
        },
      });

      store.dispatch(deleteWord(wordId));
      expect(store.getState().reviewEntriesState.sortBy).toEqual(colId);
      expect(store.getState().reviewEntriesState.words).toHaveLength(0);
    });

    test("resetReviewEntries", () => {
      const store = setupStore({
        ...persistedDefaultState,
        reviewEntriesState: {
          sortBy: colId,
          words: [mockFrontierWord()],
        },
      });

      store.dispatch(resetReviewEntries());
      expect(store.getState().reviewEntriesState.sortBy).toBeUndefined();
      expect(store.getState().reviewEntriesState.words).toHaveLength(0);
    });

    test("setAllWords", () => {
      const store = setupStore({
        ...persistedDefaultState,
        reviewEntriesState: {
          sortBy: colId,
          words: [],
        },
      });

      const frontier = [mockFrontierWord("wordA"), mockFrontierWord("wordB")];
      store.dispatch(setAllWords(frontier));
      expect(store.getState().reviewEntriesState.sortBy).toEqual(colId);
      expect(store.getState().reviewEntriesState.words).toHaveLength(
        frontier.length
      );
    });

    test("setSortBy", () => {
      const store = setupStore(persistedDefaultState);

      store.dispatch(setSortBy(colId));
      expect(store.getState().reviewEntriesState.sortBy).toEqual(colId);

      store.dispatch(setSortBy());
      expect(store.getState().reviewEntriesState.sortBy).toBeUndefined();
    });

    test("updateWord", () => {
      const frontier: Word[] = [
        { ...mockFrontierWord(), id: "otherA" },
        mockFrontierWord(),
        { ...mockFrontierWord(), id: "otherB" },
      ];
      const store = setupStore({
        ...persistedDefaultState,
        reviewEntriesState: { sortBy: colId, words: frontier },
      });

      const newVern = "updatedVern";
      const newId = "updatedId";
      const updatedWord: Word = { ...mockFrontierWord(newVern), id: newId };
      store.dispatch(updateWord({ oldId: wordId, updatedWord }));

      const { sortBy, words } = store.getState().reviewEntriesState;
      expect(sortBy).toEqual(colId);
      expect(words).toHaveLength(3);
      expect(words.find((w) => w.id === wordId)).toBeUndefined();
      const newWord = words.find((w) => w.id === newId);
      expect(newWord?.vernacular).toEqual(newVern);
    });
  });

  describe("updateFrontierWord", () => {
    beforeEach(() => {
      mockUpdateWord.mockResolvedValue(newWord());
      mockGetWordResolve(mockFrontierWord());
    });

    // Functions to make dispatch and check results at end of each test.
    async function makeDispatch(
      newRevWord: ReviewEntriesWord,
      oldRevWord: ReviewEntriesWord
    ): Promise<void> {
      const store = setupStore();
      await store.dispatch(updateFrontierWord(newRevWord, oldRevWord));
    }
    function checkResultantData(newFrontierWord: Word): void {
      expect(mockUpdateWord).toHaveBeenCalled();
      expect(mockUpdateWord.mock.calls[0][0]).toEqual(newFrontierWord);
    }

    describe("Changes data", () => {
      it("Changes the vernacular.", async () => {
        const newRevWord = mockReviewEntriesWord("foo2");
        const newFrontierWord = mockFrontierWord("foo2");

        await makeDispatch(newRevWord, mockReviewEntriesWord());
        checkResultantData(newFrontierWord);
      });

      it("Changes the note.", async () => {
        const oldNoteText = "old-note";
        const oldRevWord = mockReviewEntriesWord();
        oldRevWord.noteText = oldNoteText;
        const oldFrontierWord = mockFrontierWord();
        oldFrontierWord.note = newNote(oldNoteText, Bcp47Code.Pt);

        const newNoteText = "new-note";
        const newRevWord = mockReviewEntriesWord();
        newRevWord.noteText = newNoteText;
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.note = newNote(newNoteText, Bcp47Code.Pt);

        mockGetWordResolve(oldFrontierWord);
        await makeDispatch(newRevWord, oldRevWord);
        checkResultantData(newFrontierWord);
      });

      it("Changes the flag.", async () => {
        const oldFlagText = "old-flag";
        const oldRevWord = mockReviewEntriesWord();
        oldRevWord.flag = newFlag(oldFlagText);
        const oldFrontierWord = mockFrontierWord();
        oldFrontierWord.flag = newFlag(oldFlagText);

        const newFlagText = "new-flag";
        const newRevWord = mockReviewEntriesWord();
        newRevWord.flag = newFlag(newFlagText);
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.flag = newFlag(newFlagText);

        mockGetWordResolve(oldFrontierWord);
        await makeDispatch(newRevWord, oldRevWord);
        checkResultantData(newFrontierWord);
      });
    });

    describe("Adds data", () => {
      it("Adds a gloss to an extant sense.", async () => {
        const newRevWord = mockReviewEntriesWord();
        newRevWord.senses[0].glosses.push(gloss1);
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.senses[0].glosses = [gloss0, gloss0Es, gloss1];

        await makeDispatch(newRevWord, mockReviewEntriesWord());
        checkResultantData(newFrontierWord);
      });

      it("Adds a domain to an extant sense.", async () => {
        const newRevWord = mockReviewEntriesWord();
        newRevWord.senses[0].domains.push(domain1);
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.senses[0].semanticDomains.push(domain1);

        await makeDispatch(newRevWord, mockReviewEntriesWord());
        checkResultantData(newFrontierWord);
      });

      it("Adds a new sense.", async () => {
        const newRevWord = mockReviewEntriesWord();
        newRevWord.senses.push(sense1_local());
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.senses.push({
          ...sense1(),
          guid: expect.any(String),
        });

        await makeDispatch(newRevWord, mockReviewEntriesWord());
        checkResultantData(newFrontierWord);
      });

      it("Adds a flag.", async () => {
        const newFlagText = "new-flag";
        const newRevWord = mockReviewEntriesWord();
        newRevWord.flag = newFlag(newFlagText);
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.flag = newFlag(newFlagText);

        await makeDispatch(newRevWord, mockReviewEntriesWord());
        checkResultantData(newFrontierWord);
      });
    });

    describe("Removes data", () => {
      it("Removes a gloss from an extant sense.", async () => {
        const oldRevWord = mockReviewEntriesWord();
        const oldSense = sense1_local();
        oldRevWord.senses.push({
          ...oldSense,
          glosses: [...oldSense.glosses, gloss0],
        });
        const newRevWord = mockReviewEntriesWord();
        newRevWord.senses.push(oldSense);

        const oldFrontierWord = mockFrontierWord();
        const oldFrontierSense = sense1();
        oldFrontierWord.senses.push({
          ...oldFrontierSense,
          glosses: [...oldFrontierSense.glosses, gloss0],
        });
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.senses.push(oldFrontierSense);

        mockGetWordResolve(oldFrontierWord);
        await makeDispatch(newRevWord, oldRevWord);
        checkResultantData(newFrontierWord);
      });

      it("Removes a domain from an extant sense.", async () => {
        const oldRevWord = mockReviewEntriesWord();
        const oldSense = sense1_local();
        oldRevWord.senses.push({
          ...oldSense,
          domains: [...oldSense.domains, domain0],
        });
        const newRevWord = mockReviewEntriesWord();
        newRevWord.senses.push(oldSense);

        const oldFrontierWord = mockFrontierWord();
        const oldFrontierSense = sense1();
        oldFrontierWord.senses.push({
          ...oldFrontierSense,
          semanticDomains: [...oldFrontierSense.semanticDomains, domain0],
        });
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.senses.push(oldFrontierSense);

        mockGetWordResolve(oldFrontierWord);
        await makeDispatch(newRevWord, oldRevWord);
        checkResultantData(newFrontierWord);
      });

      it("Removes a sense.", async () => {
        const oldRevWord = mockReviewEntriesWord();
        oldRevWord.senses.push(sense1_local());
        const oldFrontierWord = mockFrontierWord();
        oldFrontierWord.senses.push(sense1());

        mockGetWordResolve(oldFrontierWord);
        await makeDispatch(mockReviewEntriesWord(), oldRevWord);
        checkResultantData(mockFrontierWord());
      });

      it("Removes the flag.", async () => {
        const oldFlagText = "old-flag";
        const oldRevWord = mockReviewEntriesWord();
        oldRevWord.flag = newFlag(oldFlagText);
        const oldFrontierWord = mockFrontierWord();
        oldRevWord.flag = newFlag(oldFlagText);

        mockGetWordResolve(oldFrontierWord);
        await makeDispatch(mockReviewEntriesWord(), oldRevWord);
        checkResultantData(mockFrontierWord());
      });
    });

    describe("Circumvents bad data", () => {
      it("Restores vernacular when vernacular deleted.", async () => {
        const newRevWord = mockReviewEntriesWord("");
        const oldFrontierWord = mockFrontierWord("");

        mockGetWordResolve(oldFrontierWord);
        await makeDispatch(newRevWord, mockReviewEntriesWord());
        checkResultantData(mockFrontierWord());
      });

      it("Ignores a new sense with no glosses, domains.", async () => {
        const newRevWord = mockReviewEntriesWord();
        newRevWord.senses.push({ ...sense1_local(), glosses: [], domains: [] });

        await makeDispatch(newRevWord, mockReviewEntriesWord());
        checkResultantData(mockFrontierWord());
      });
    });

    describe("Rejects bad, irrecoverable data", () => {
      it("Rejects a vernacular which is empty and cannot be restored.", async () => {
        const oldRevWord = mockReviewEntriesWord("");
        const newRevWord = mockReviewEntriesWord("");
        const oldFrontierWord = mockFrontierWord("");

        mockGetWordResolve(oldFrontierWord);
        expect(
          await makeDispatch(newRevWord, oldRevWord)
            .then(() => false)
            .catch(() => true)
        ).toBeTruthy();
      });

      it("Rejects a new sense with no glosses.", async () => {
        const newRevWord = mockReviewEntriesWord();
        newRevWord.senses.push({
          ...sense1_local(),
          glosses: [],
        });

        expect(
          await makeDispatch(newRevWord, mockReviewEntriesWord())
            .then(() => false)
            .catch(() => true)
        ).toBeTruthy();
      });
    });
  });

  describe("getSenseFromEditSense", () => {
    const oldSenses = [sense0(), sense1()];

    it("Creates a new sense.", () => {
      const expectedSense = newSense("newSense");
      const editSense = new ReviewEntriesSense(expectedSense);
      expectedSense.guid = expect.any(String);
      const resultSense = getSenseFromEditSense(editSense, oldSenses);
      expect(resultSense).toEqual(expectedSense);
    });

    it("Updates an old sense with new domains.", () => {
      const expectedSense = sense0();
      expectedSense.semanticDomains = sense1().semanticDomains;
      const editSense = new ReviewEntriesSense(expectedSense);
      const resultSense = getSenseFromEditSense(editSense, oldSenses);
      expect(resultSense).toEqual(expectedSense);
    });

    it("Updates an old sense with new glosses.", () => {
      const expectedSense = sense0();
      expectedSense.glosses = sense1().glosses;
      const editSense = new ReviewEntriesSense(expectedSense);
      const resultSense = getSenseFromEditSense(editSense, oldSenses);
      expect(resultSense).toEqual(expectedSense);
    });
  });

  describe("getSenseError", () => {
    it("By default, no-gloss triggers error.", () => {
      const sense = new ReviewEntriesSense(sense0());
      expect(getSenseError(sense)).toBeUndefined();
      sense.glosses = [];
      expect(getSenseError(sense)).toEqual("reviewEntries.error.gloss");
    });

    it("By default, no-domain does not trigger error.", () => {
      const sense = new ReviewEntriesSense(sense0());
      expect(getSenseError(sense)).toBeUndefined();
      sense.domains = [];
      expect(getSenseError(sense)).toBeUndefined();
    });

    it("Can allow no-gloss and error for no-domain.", () => {
      const sense = new ReviewEntriesSense(sense0());
      expect(getSenseError(sense, false, true)).toBeUndefined();
      sense.glosses = [];
      expect(getSenseError(sense, false, true)).toBeUndefined();
      sense.domains = [];
      expect(getSenseError(sense, false, true)).toEqual(
        "reviewEntries.error.domain"
      );
    });
  });
});
