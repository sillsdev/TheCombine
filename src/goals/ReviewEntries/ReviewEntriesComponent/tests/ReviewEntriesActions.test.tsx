import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import {
  getSenseFromEditSense,
  setAnalysisLang,
  updateFrontierWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";
import {
  ReviewEntriesSense,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { defaultProject } from "types/project";
import { Gloss, SemanticDomain, Sense, State, Word } from "types/word";

const mockGetWord = jest.fn();
const mockGetProject = jest.fn();
const mockUpdateWord = jest.fn();
function mockGetWordResolve(data: Word) {
  mockGetWord.mockResolvedValue(JSON.parse(JSON.stringify(data)));
}

jest.mock("backend", () => ({
  getProject: (projectId: string) => mockGetProject(projectId),
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
const langFr = "fr";
const commonGuid = "mockGuid";
const gloss0: Gloss = { language: langEn, def: "gloss" };
const gloss0Es: Gloss = { language: langEs, def: "glossario" };
const gloss1: Gloss = { language: langEn, def: "infinite" };
const domain0: SemanticDomain = { name: "Universe", id: "1" };
const domain1: SemanticDomain = { name: "Shadow", id: "8.3.3.2.1" };

// Dummy sense and word creators.
function sense0(): Sense {
  return {
    guid: commonGuid + "0",
    glosses: [{ ...gloss0 }, { ...gloss0Es }],
    semanticDomains: [{ ...domain0 }],
  };
}
function sense1(): Sense {
  return {
    guid: commonGuid + "1",
    glosses: [{ ...gloss1 }],
    semanticDomains: [{ ...domain1 }],
  };
}
function sense1_local() {
  return new ReviewEntriesSense(sense1());
}
function mockFrontierWord(): Word {
  return {
    ...new Word(),
    guid: commonGuid,
    id: "word",
    vernacular: "word",
    senses: [sense0()],
  };
}
function mockReviewEntriesWord(lang: string = langEn): ReviewEntriesWord {
  return {
    ...new ReviewEntriesWord(),
    id: "word",
    vernacular: "word",
    senses: [new ReviewEntriesSense(sense0(), lang)],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockStore.clearActions();
});

describe("ReviewEntriesActions", () => {
  describe("updateFrontierWord", () => {
    beforeEach(() => {
      mockUpdateWord.mockResolvedValue(new Word());
      mockGetWordResolve(mockFrontierWord());
    });

    // Functions to make dispatch and check results at end of each test.
    async function makeDispatch(
      newWord: ReviewEntriesWord,
      oldWord: ReviewEntriesWord,
      language = langEn
    ) {
      await mockStore.dispatch<any>(
        updateFrontierWord(newWord, oldWord, language)
      );
    }
    function checkResultantData(newFrontierWord: Word) {
      expect(mockUpdateWord.mock.calls[0][0]).toEqual(newFrontierWord);
    }

    describe("Adds data", () => {
      it("Changes the vernacular.", async () => {
        const newWord = mockReviewEntriesWord();
        newWord.vernacular = "foo2";
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.vernacular = "foo2";

        await makeDispatch(newWord, mockReviewEntriesWord());
        checkResultantData(newFrontierWord);
      });

      it("Adds a gloss to an extant sense.", async () => {
        const newWord = mockReviewEntriesWord();
        newWord.senses[0].glosses.push(gloss1);
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.senses[0].glosses = [gloss0, gloss1, gloss0Es];

        await makeDispatch(newWord, mockReviewEntriesWord());
        checkResultantData(newFrontierWord);
      });

      it("Adds a domain to an extant sense.", async () => {
        const newWord = mockReviewEntriesWord();
        newWord.senses[0].domains.push(domain1);
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.senses[0].semanticDomains.push(domain1);

        await makeDispatch(newWord, mockReviewEntriesWord());
        checkResultantData(newFrontierWord);
      });
      it("Adds a new sense.", async () => {
        const newWord = mockReviewEntriesWord();
        newWord.senses.push(sense1_local());
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.senses.push({
          ...sense1(),
          guid: expect.any(String),
          accessibility: State.Active,
        });

        await makeDispatch(newWord, mockReviewEntriesWord());
        checkResultantData(newFrontierWord);
      });
    });

    describe("Removes data", () => {
      it("Removes a gloss from an extant sense.", async () => {
        const oldWord = mockReviewEntriesWord();
        const oldSense = sense1_local();
        oldWord.senses.push({
          ...oldSense,
          glosses: [...oldSense.glosses, gloss0],
        });
        const newWord = mockReviewEntriesWord();
        newWord.senses.push(oldSense);
        const oldFrontierWord = mockFrontierWord();
        const oldFrontierSense = sense1();
        oldFrontierWord.senses.push({
          ...oldFrontierSense,
          glosses: [...oldFrontierSense.glosses, gloss0],
        });
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.senses.push(oldFrontierSense);

        mockGetWordResolve(oldFrontierWord);
        await makeDispatch(newWord, oldWord);
        checkResultantData(newFrontierWord);
      });

      it("Removes a domain from an extant sense.", async () => {
        const oldWord = mockReviewEntriesWord();
        const oldSense = sense1_local();
        oldWord.senses.push({
          ...oldSense,
          domains: [...oldSense.domains, domain0],
        });
        const newWord = mockReviewEntriesWord();
        newWord.senses.push(oldSense);
        const oldFrontierWord = mockFrontierWord();
        const oldFrontierSense = sense1();
        oldFrontierWord.senses.push({
          ...oldFrontierSense,
          semanticDomains: [...oldFrontierSense.semanticDomains, domain0],
        });
        const newFrontierWord = mockFrontierWord();
        newFrontierWord.senses.push(oldFrontierSense);

        mockGetWordResolve(oldFrontierWord);
        await makeDispatch(newWord, oldWord);
        checkResultantData(newFrontierWord);
      });

      it("Removes a sense.", async () => {
        const oldWord = mockReviewEntriesWord();
        oldWord.senses.push(sense1_local());
        const oldFrontierWord = mockFrontierWord();
        oldFrontierWord.senses.push(sense1());

        mockGetWordResolve(oldFrontierWord);
        await makeDispatch(mockReviewEntriesWord(), oldWord);
        checkResultantData(mockFrontierWord());
      });
    });

    describe("Circumvents bad data", () => {
      it("Restores vernacular when vernacular deleted.", async () => {
        const newWord = mockReviewEntriesWord();
        newWord.vernacular = "";
        const oldFrontierWord = mockFrontierWord();
        oldFrontierWord.vernacular = "";

        mockGetWordResolve(oldFrontierWord);
        await makeDispatch(newWord, mockReviewEntriesWord());
        checkResultantData(mockFrontierWord());
      });

      it("Ignores a new sense with no glosses, domains.", async () => {
        const newWord = mockReviewEntriesWord();
        newWord.senses.push({ ...sense1_local(), glosses: [], domains: [] });

        await makeDispatch(newWord, mockReviewEntriesWord());
        checkResultantData(mockFrontierWord());
      });

      it("Reverts glosses when all glosses of an old word removed.", async () => {
        const newWord = mockReviewEntriesWord();
        newWord.senses = newWord.senses.map((s) => ({ ...s, glosses: [] }));

        await makeDispatch(newWord, mockReviewEntriesWord());
        checkResultantData(mockFrontierWord());
      });

      it("Reverts domains when all domains of an old word removed.", async () => {
        const newWord = mockReviewEntriesWord();
        newWord.senses = newWord.senses.map((s) => ({ ...s, domains: [] }));

        await makeDispatch(newWord, mockReviewEntriesWord());
        checkResultantData(mockFrontierWord());
      });
    });

    describe("Rejects bad, irrecoverable data", () => {
      it("Rejects a vernacular which is empty and cannot be restored.", async () => {
        const oldWord = mockReviewEntriesWord();
        oldWord.vernacular = "";
        const newWord = mockReviewEntriesWord();
        newWord.vernacular = "";
        const oldFrontierWord = mockFrontierWord();
        oldFrontierWord.vernacular = "";

        mockGetWordResolve(oldFrontierWord);
        expect(
          await makeDispatch(newWord, oldWord)
            .then(() => false)
            .catch(() => true)
        ).toBeTruthy();
      });

      it("Rejects a new sense with no glosses.", async () => {
        const newWord = mockReviewEntriesWord();
        newWord.senses.push({
          ...sense1_local(),
          glosses: [],
        });

        expect(
          await makeDispatch(newWord, mockReviewEntriesWord())
            .then(() => false)
            .catch(() => true)
        ).toBeTruthy();
      });

      it("Rejects new sense with no domains.", async () => {
        const newWord = mockReviewEntriesWord();
        newWord.senses.push({
          ...sense1_local(),
          domains: [],
        });

        expect(
          await makeDispatch(newWord, mockReviewEntriesWord())
            .then(() => false)
            .catch(() => true)
        ).toBeTruthy();
      });
    });
  });

  describe("setAnalysisLange", () => {
    it("Sets the analysis language.", async () => {
      mockGetProject.mockImplementation(() =>
        Promise.resolve({
          ...defaultProject,
          analysisWritingSystems: [{ bcp47: langFr }],
        })
      );
      await mockStore.dispatch<any>(setAnalysisLang());

      expect(mockStore.getActions()[0].analysisLanguage).toBe(langFr);
      expect(mockStore.getActions()[0].type).toBe("SET_ANALYSIS_LANGUAGE");
    });
  });

  describe("getSenseFromEditSense", () => {
    const oldSenses = [sense0(), sense1()];
    it("Creates a new sense.", () => {
      const expectedSense = new Sense("newSense");
      const editSense = new ReviewEntriesSense(expectedSense);
      expectedSense.guid = expect.any(String);
      expectedSense.accessibility = State.Active;
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
    it("Uses old glosses if edit sense has none.", () => {
      const expectedSense = sense0();
      const editSense = new ReviewEntriesSense(expectedSense);
      editSense.glosses = [];
      const resultSense = getSenseFromEditSense(editSense, oldSenses);
      expect(resultSense).toEqual(expectedSense);
    });
    it("Adds glosses without losing glosses from languages other than the one specified.", () => {
      const expectedSense = sense0();
      expectedSense.glosses.push(gloss1);
      const editSense = new ReviewEntriesSense(expectedSense, langEn);
      expect(editSense.glosses).not.toContainEqual(gloss0Es);
      const resultSense = getSenseFromEditSense(editSense, oldSenses, langEn);
      expect(resultSense.glosses.length).toEqual(expectedSense.glosses.length);
      resultSense.glosses.forEach((g) => {
        expect(expectedSense.glosses).toContainEqual(g);
      });
    });
  });
});
