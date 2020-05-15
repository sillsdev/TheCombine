import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import axios from "axios";

import { updateFrontierWord } from "../ReviewEntriesActions";
import {
  ReviewEntriesWord,
  OLD_SENSE,
  SEP_CHAR,
  ReviewEntriesSense,
} from "../ReviewEntriesTypes";
import {
  SemanticDomain,
  Word,
  State,
  Gloss,
  Sense,
} from "../../../../types/word";

// Mocks
const mockAxios = axios as jest.Mocked<typeof axios>;
const mockStore = configureMockStore([thunk])();

// Dummy glosses and domains used in testing
const gloss0: Gloss = { language: "en", def: "gloss" };
const gloss1: Gloss = { language: "en", def: "infinite" };
const gloss_foreign: Gloss = { language: "es", def: "glossario" };
const domain0: SemanticDomain = { name: "Universe", id: "1" };
const domain1: SemanticDomain = { name: "Shadow", id: "8.3.3.2.1" };

// New  senses
const sense0_frontier: Sense = {
  glosses: [gloss1],
  semanticDomains: [domain1],
  accessibility: State.active,
};
const sense0_local: ReviewEntriesSense = {
  senseId: "sense0",
  glosses: gloss1.def,
  domains: [domain1],
  deleted: false,
};

// Old frontier word: the version of this word in the frontier
const oldFrontierWord: Word = {
  id: "word",
  vernacular: "word",
  senses: [
    {
      glosses: [gloss0, gloss_foreign],
      semanticDomains: [domain0],
    },
  ],
  audio: [],
  created: "",
  modified: "",
  history: [],
  partOfSpeech: "",
  editedBy: [],
  otherField: "",
  plural: "",
};

// oldWord: the version of this word in local memory
const oldWord: ReviewEntriesWord = {
  id: "word",
  vernacular: "word",
  senses: [
    {
      senseId: "oldWordSense" + OLD_SENSE,
      glosses: gloss0.def,
      domains: [domain0],
      deleted: false,
    },
  ],
  pronunciationFiles: [],
};

beforeEach(() => {
  mockAxios.put.mockClear();
  mockBackendReturn(oldFrontierWord);

  mockStore.clearActions();
});

describe("Test ReviewEntriesActions", () => {
  // Tests adding data
  it("Changes the vernacular", async () => {
    await makeDispatch({ ...oldWord, vernacular: "foo2" }, oldWord);
    checkResultantData({ ...oldFrontierWord, vernacular: "foo2" });
  });

  it("Adds a gloss to an extant sense", async () => {
    await makeDispatch(
      {
        ...oldWord,
        senses: oldWord.senses.map((value) => {
          return {
            ...value,
            glosses: value.glosses + SEP_CHAR + gloss1.def,
          };
        }),
      },
      oldWord
    );
    checkResultantData({
      ...oldFrontierWord,
      senses: [
        {
          ...oldFrontierWord.senses[0],
          glosses: [gloss0, gloss1, gloss_foreign],
        },
      ],
    });
  });

  it("Adds a domain to an extant sense", async () => {
    await makeDispatch(
      {
        ...oldWord,
        senses: oldWord.senses.map((value) => {
          return {
            ...value,
            domains: [...value.domains, domain1],
          };
        }),
      },
      oldWord
    );
    checkResultantData({
      ...oldFrontierWord,
      senses: oldFrontierWord.senses.map((sense) => {
        return {
          ...sense,
          semanticDomains: [...sense.semanticDomains, domain1],
        };
      }),
    });
  });

  it("Adds a new sense", async () => {
    await makeDispatch(
      {
        ...oldWord,
        senses: [...oldWord.senses, sense0_local],
      },
      oldWord
    );
    checkResultantData({
      ...oldFrontierWord,
      senses: [...oldFrontierWord.senses, sense0_frontier],
    });
  });

  // Tests removing data
  it("Removes a gloss from an extant sense", async () => {
    mockBackendReturn({
      ...oldFrontierWord,
      senses: [
        ...oldFrontierWord.senses,
        { ...sense0_frontier, glosses: [...sense0_frontier.glosses, gloss0] },
      ],
    });
    await makeDispatch(
      { ...oldWord, senses: [...oldWord.senses, sense0_local] },
      {
        ...oldWord,
        senses: [
          ...oldWord.senses,
          {
            ...sense0_local,
            glosses: sense0_local.glosses + SEP_CHAR + gloss0.def,
          },
        ],
      }
    );
    checkResultantData({
      ...oldFrontierWord,
      senses: [...oldFrontierWord.senses, sense0_frontier],
    });
  });

  it("Removes a domain from an extant sense", async () => {
    mockBackendReturn({
      ...oldFrontierWord,
      senses: [
        ...oldFrontierWord.senses,
        {
          ...sense0_frontier,
          semanticDomains: [...sense0_frontier.semanticDomains, domain0],
        },
      ],
    });
    await makeDispatch(
      { ...oldWord, senses: [...oldWord.senses, sense0_local] },
      {
        ...oldWord,
        senses: [
          ...oldWord.senses,
          {
            ...sense0_local,
            domains: [...sense0_local.domains, domain0],
          },
        ],
      }
    );
    checkResultantData({
      ...oldFrontierWord,
      senses: [...oldFrontierWord.senses, sense0_frontier],
    });
  });

  it("Removes a sense", async () => {
    mockBackendReturn({
      ...oldFrontierWord,
      senses: [...oldFrontierWord.senses, sense0_frontier],
    });
    await makeDispatch(oldWord, {
      ...oldWord,
      senses: [...oldWord.senses, sense0_local],
    });
    checkResultantData(oldFrontierWord);
  });

  // Tests circumventing bad data
  it("Restores vernacular when vernacular deleted", async () => {
    mockBackendReturn({
      ...oldFrontierWord,
      vernacular: "",
    });
    await makeDispatch(
      {
        ...oldWord,
        vernacular: "",
      },
      oldWord
    );
    checkResultantData(oldFrontierWord);
  });

  it("Ignores a new sense with no gloss and no domains", async () => {
    await makeDispatch(
      {
        ...oldWord,
        senses: [
          ...oldWord.senses,
          { ...sense0_local, glosses: "", domains: [] },
        ],
      },
      oldWord
    );
    checkResultantData(oldFrontierWord);
  });

  it("Reverts glosses when all glosses of an old word removed", async () => {
    await makeDispatch(
      {
        ...oldWord,
        senses: oldWord.senses.map((value) => ({ ...value, glosses: "" })),
      },
      oldWord
    );
    checkResultantData(oldFrontierWord);
  });

  it("Reverts domains when all domains of an old word removed", async () => {
    await makeDispatch(
      {
        ...oldWord,
        senses: oldWord.senses.map((value) => ({ ...value, domains: [] })),
      },
      oldWord
    );
    checkResultantData(oldFrontierWord);
  });

  it("Reverts senses when all senses of an old word removed", async () => {
    await makeDispatch(
      {
        ...oldWord,
        senses: [],
      },
      oldWord
    );
    checkResultantData(oldFrontierWord);
  });

  // Tests rejection of bad data
  it("Rejects a vernacular which is empty and cannot be restored", async () => {
    mockBackendReturn({ ...oldFrontierWord, vernacular: "" });
    expect(
      await makeDispatch(
        { ...oldWord, vernacular: "" },
        { ...oldWord, vernacular: "" }
      )
        .then(() => false)
        .catch(() => true)
    ).toBeTruthy();
  });

  it("Rejects a new sense with no gloss", async () => {
    expect(
      await makeDispatch(
        {
          ...oldWord,
          senses: [...oldWord.senses, { ...sense0_local, glosses: "" }],
        },
        oldWord
      )
        .then(() => false)
        .catch(() => true)
    ).toBeTruthy();
  });

  it("Rejects new sense with no domains", async () => {
    expect(
      await makeDispatch(
        {
          ...oldWord,
          senses: [...oldWord.senses, { ...sense0_local, domains: [] }],
        },
        oldWord
      )
        .then(() => false)
        .catch(() => true)
    ).toBeTruthy();
  });
});

function mockBackendReturn(data: Word) {
  mockAxios.get.mockClear();
  mockAxios.get.mockImplementationOnce(() =>
    Promise.resolve({
      data: JSON.parse(JSON.stringify(data)),
    })
  );
}

function makeDispatch(
  newWord: ReviewEntriesWord,
  oldWord: ReviewEntriesWord,
  language = "en"
) {
  return mockStore.dispatch<any>(
    updateFrontierWord(newWord, oldWord, language)
  );
}

function checkResultantData(newFrontierWord: Word) {
  expect(mockAxios.put.mock.calls[0][1]).toEqual(newFrontierWord);
}
