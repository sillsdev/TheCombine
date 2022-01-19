import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { Sense, Word } from "api/models";
import {
  getSenseError,
  getSenseFromEditSense,
  updateFrontierWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesActions";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { newGloss, newSemanticDomain, newSense, newWord } from "types/word";

const mockGetWord = jest.fn();
const mockUpdateWord = jest.fn();
function mockGetWordResolve(data: Word) {
  mockGetWord.mockResolvedValue(JSON.parse(JSON.stringify(data)));
}

jest.mock("backend", () => ({
  getWord: (wordId: string) => mockGetWord(wordId),
  updateWord: (word: Word) => mockUpdateWord(word),
}));

jest.mock("backend/localStorage", () => ({
  getProjectId: jest.fn(),
}));

const mockStore = configureMockStore([thunk])();

// Dummy strings, glosses, and domains.
const langEn = "en";
const langEs = "es";
const commonGuid = "mockGuid";
const gloss0 = newGloss("gloss", langEn);
const gloss0Es = newGloss("glossario", langEs);
const gloss1 = newGloss("infinite", langEn);
const domain0 = newSemanticDomain("1", "Universe");
const domain1 = newSemanticDomain("8.3.3.2.1", "Shadow");

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
function sense1_local() {
  return new ReviewEntriesSense(sense1());
}
function mockFrontierWord(vernacular = "word"): Word {
  return {
    ...newWord(vernacular),
    guid: commonGuid,
    id: "word",
    senses: [sense0()],
  };
}
function mockReviewEntriesWord(vernacular = "word"): ReviewEntriesWord {
  return {
    ...new ReviewEntriesWord(),
    id: "word",
    vernacular,
    senses: [new ReviewEntriesSense(sense0())],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockStore.clearActions();
});

describe("ReviewEntriesActions", () => {
  describe("updateFrontierWord", () => {
    beforeEach(() => {
      mockUpdateWord.mockResolvedValue(newWord());
      mockGetWordResolve(mockFrontierWord());
    });

    // Functions to make dispatch and check results at end of each test.
    async function makeDispatch(
      newRevWord: ReviewEntriesWord,
      oldRevWord: ReviewEntriesWord
    ) {
      await mockStore.dispatch<any>(updateFrontierWord(newRevWord, oldRevWord));
    }
    function checkResultantData(newFrontierWord: Word) {
      expect(mockUpdateWord.mock.calls[0][0]).toEqual(newFrontierWord);
    }

    describe("Adds data", () => {
      it("Changes the vernacular.", async () => {
        const newRevWord = mockReviewEntriesWord("foo2");
        const newFrontierWord = mockFrontierWord("foo2");

        await makeDispatch(newRevWord, mockReviewEntriesWord());
        checkResultantData(newFrontierWord);
      });

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
