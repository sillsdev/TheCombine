import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import {
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

jest.mock("backend", () => ({
  getProject: (projectId: string) => mockGetProject(projectId),
  getWord: (wordId: string) => mockGetWord(wordId),
  updateWord: (word: Word) => mockUpdateWord(word),
}));

jest.mock("backend/localStorage", () => ({
  getProjectId: jest.fn(),
}));

// Mocks
const mockStore = configureMockStore([thunk])();

// Dummy glosses, domains, senses used in testing
const langEn = "en";
const langEs = "es";
const gloss0: Gloss = { language: langEn, def: "gloss" };
const gloss0Es: Gloss = { language: langEs, def: "glossario" };
const gloss1: Gloss = { language: langEn, def: "infinite" };
const domain0: SemanticDomain = { name: "Universe", id: "1" };
const domain1: SemanticDomain = { name: "Shadow", id: "8.3.3.2.1" };
const commonGuid = "mockGuid";
const sense0: () => Sense = () => ({
  guid: commonGuid + "0",
  glosses: [{ ...gloss0 }, { ...gloss0Es }],
  semanticDomains: [{ ...domain0 }],
});
const sense1_frontier: Sense = {
  guid: commonGuid + "1",
  glosses: [gloss1],
  semanticDomains: [domain1],
  accessibility: State.Active,
};
const sense1_local = new ReviewEntriesSense(sense1_frontier);

function mockFrontierWord(): Word {
  return {
    ...new Word(),
    guid: commonGuid,
    id: "word",
    vernacular: "word",
    senses: [sense0()],
  };
}
function mockWord(): ReviewEntriesWord {
  return {
    ...new ReviewEntriesWord(),
    id: "word",
    vernacular: "word",
    senses: [new ReviewEntriesSense(sense0(), langEn)],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockStore.clearActions();
  mockUpdateWord.mockImplementation(() => Promise.resolve(new Word()));
  mockBackendReturn(mockFrontierWord());
});

describe("ReviewEntriesActions", () => {
  // Tests adding data
  it("Changes the vernacular", async () => {
    const newWord = mockWord();
    newWord.vernacular = "foo2";
    const newFrontierWord = mockFrontierWord();
    newFrontierWord.vernacular = "foo2";

    await makeDispatch(newWord, mockWord());
    checkResultantData(newFrontierWord);
  });

  it("Adds a gloss to an extant sense", async () => {
    const newWord = mockWord();
    newWord.senses[0].glosses.push(gloss1);
    const newFrontierWord = mockFrontierWord();
    newFrontierWord.senses[0].glosses = [gloss0, gloss1, gloss0Es];

    await makeDispatch(newWord, mockWord());
    checkResultantData(newFrontierWord);
  });

  it("Adds a domain to an extant sense", async () => {
    const newWord = mockWord();
    newWord.senses[0].domains.push(domain1);
    const newFrontierWord = mockFrontierWord();
    newFrontierWord.senses[0].semanticDomains.push(domain1);

    await makeDispatch(newWord, mockWord());
    checkResultantData(newFrontierWord);
  });

  it("Adds a new sense", async () => {
    const newWord = mockWord();
    newWord.senses.push(sense1_local);
    const newFrontierWord = mockFrontierWord();
    newFrontierWord.senses.push({
      ...sense1_frontier,
      guid: expect.any(String),
    });

    await makeDispatch(newWord, mockWord());
    checkResultantData(newFrontierWord);
  });

  // Tests removing data
  it("Removes a gloss from an extant sense", async () => {
    const oldWord = mockWord();
    oldWord.senses.push({
      ...sense1_local,
      glosses: [...sense1_local.glosses, gloss0],
    });
    const newWord = mockWord();
    newWord.senses.push(sense1_local);
    const oldFrontierWord = mockFrontierWord();
    oldFrontierWord.senses.push({
      ...sense1_frontier,
      glosses: [...sense1_frontier.glosses, gloss0],
    });
    const newFrontierWord = mockFrontierWord();
    newFrontierWord.senses.push(sense1_frontier);

    mockBackendReturn(oldFrontierWord);
    await makeDispatch(newWord, oldWord);
    checkResultantData(newFrontierWord);
  });

  it("Removes a domain from an extant sense", async () => {
    const oldWord = mockWord();
    oldWord.senses.push({
      ...sense1_local,
      domains: [...sense1_local.domains, domain0],
    });
    const newWord = mockWord();
    newWord.senses.push(sense1_local);
    const oldFrontierWord = mockFrontierWord();
    oldFrontierWord.senses.push({
      ...sense1_frontier,
      semanticDomains: [...sense1_frontier.semanticDomains, domain0],
    });
    const newFrontierWord = mockFrontierWord();
    newFrontierWord.senses.push(sense1_frontier);

    mockBackendReturn(oldFrontierWord);
    await makeDispatch(newWord, oldWord);
    checkResultantData(newFrontierWord);
  });

  it("Removes a sense", async () => {
    const oldWord = mockWord();
    oldWord.senses.push(sense1_local);
    const oldFrontierWord = mockFrontierWord();
    oldFrontierWord.senses.push(sense1_frontier);

    mockBackendReturn(oldFrontierWord);
    await makeDispatch(mockWord(), oldWord);
    checkResultantData(mockFrontierWord());
  });

  // Tests circumventing bad data
  it("Restores vernacular when vernacular deleted", async () => {
    const newWord = mockWord();
    newWord.vernacular = "";
    const oldFrontierWord = mockFrontierWord();
    oldFrontierWord.vernacular = "";

    mockBackendReturn(oldFrontierWord);
    await makeDispatch(newWord, mockWord());
    checkResultantData(mockFrontierWord());
  });

  it("Ignores a new sense with no glosses, domains", async () => {
    const newWord = mockWord();
    newWord.senses.push({ ...sense1_local, glosses: [], domains: [] });

    await makeDispatch(newWord, mockWord());
    checkResultantData(mockFrontierWord());
  });

  it("Reverts glosses when all glosses of an old word removed", async () => {
    const newWord = mockWord();
    newWord.senses = newWord.senses.map((s) => ({ ...s, glosses: [] }));

    await makeDispatch(newWord, mockWord());
    checkResultantData(mockFrontierWord());
  });

  it("Reverts domains when all domains of an old word removed", async () => {
    const newWord = mockWord();
    newWord.senses = newWord.senses.map((s) => ({ ...s, domains: [] }));

    await makeDispatch(newWord, mockWord());
    checkResultantData(mockFrontierWord());
  });

  // Tests rejection of bad data
  it("Rejects a vernacular which is empty and cannot be restored", async () => {
    const oldWord = mockWord();
    oldWord.vernacular = "";
    const newWord = mockWord();
    newWord.vernacular = "";
    const oldFrontierWord = mockFrontierWord();
    oldFrontierWord.vernacular = "";

    mockBackendReturn(oldFrontierWord);
    expect(
      await makeDispatch(newWord, oldWord)
        .then(() => false)
        .catch(() => true)
    ).toBeTruthy();
  });

  it("Rejects a new sense with no glosses", async () => {
    const newWord = mockWord();
    newWord.senses.push({
      ...sense1_local,
      glosses: [],
    });

    expect(
      await makeDispatch(newWord, mockWord())
        .then(() => false)
        .catch(() => true)
    ).toBeTruthy();
  });

  it("Rejects new sense with no domains", async () => {
    const newWord = mockWord();
    newWord.senses.push({
      ...sense1_local,
      domains: [],
    });

    expect(
      await makeDispatch(newWord, mockWord())
        .then(() => false)
        .catch(() => true)
    ).toBeTruthy();
  });

  it("Sets the analysis language", async () => {
    const langFr = "fr";
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

function mockBackendReturn(data: Word) {
  mockGetWord.mockImplementation(() =>
    Promise.resolve(JSON.parse(JSON.stringify(data)))
  );
}

function makeDispatch(
  newWord: ReviewEntriesWord,
  oldWord: ReviewEntriesWord,
  language = langEn
) {
  return mockStore.dispatch<any>(
    updateFrontierWord(newWord, oldWord, language)
  );
}

function checkResultantData(newFrontierWord: Word) {
  expect(mockUpdateWord.mock.calls[0][0]).toEqual(newFrontierWord);
}
