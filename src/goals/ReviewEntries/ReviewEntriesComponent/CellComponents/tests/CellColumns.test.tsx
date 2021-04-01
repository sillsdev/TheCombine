import ReactDOM from "react-dom";

import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import columns from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";
import { Gloss, SemanticDomain } from "types/word";

const GLOSS: Gloss = { def: "hoovy", language: "en" };
const DOMAIN: SemanticDomain = { name: "Person", id: "0.1" };
const DOMAIN2: SemanticDomain = { name: "Universe", id: "1" };
const WORD: ReviewEntriesWord = {
  ...new ReviewEntriesWord(),
  id: "id",
  vernacular: "pootis",
  senses: [
    {
      guid: "sense0",
      glosses: [
        { def: "meaning of life", language: "en" },
        { def: "life's meaning", language: "en" },
      ],
      domains: [DOMAIN2, { name: "Joke", id: "0.0" }],
      deleted: false,
    },
    {
      guid: "sense1",
      glosses: [{ def: "heavy noise", language: "en" }, GLOSS],
      domains: [DOMAIN, { name: "Joke", id: "0" }],
      deleted: false,
    },
  ],
};

// Last sort sense is the sense that should bubble to the end, first sort sense to the front
const WORD_0 = {
  senses: [
    {
      guid: "",
      glosses: [{ def: "~", language: "en" }],
      domains: [{ name: "", id: "7.7.6" }],
      deleted: false,
    },
  ],
};
const WORD_1 = {
  senses: [
    {
      guid: "",
      glosses: [{ def: "a", language: "en" }],
      domains: [{ name: "", id: "9.9.9.9.9" }],
      deleted: false,
    },
  ],
};
const WORD_2 = {
  senses: [
    {
      guid: "",
      glosses: [{ def: "b", language: "en" }],
      domains: [{ name: "", id: "0.0.0.0.0" }],
      deleted: false,
    },
  ],
};
const WORD_3 = {
  senses: [
    {
      guid: "",
      glosses: [{ def: "\0", language: "en" }],
      domains: [{ name: "", id: "7.7.7" }],
      deleted: false,
    },
  ],
};
const SORT_BY_GLOSSES = [WORD_3, WORD_1, WORD_2, WORD_0];
const SORT_BY_DOMAINS = [WORD_2, WORD_0, WORD_3, WORD_1];

describe("Tests cell column functions", () => {
  // Vernacular is the only one which isn't just returning another object, and thus the only one tested here
  it("Renders vernacular without crashing", () => {
    const div = document.createElement("div");
    if (columns[0].render) {
      ReactDOM.render(<div>{columns[0].render(WORD, "row")}</div>, div);
      ReactDOM.unmountComponentAtNode(div);
    } else {
      fail(
        "There is no render on column[0]: domains.\nDid the vernacular get moved to a different column?"
      );
    }
  });

  // Test searching senses
  it("Returns true when searching a word for an extant gloss", () => {
    if (columns[1].customFilterAndSearch) {
      expect(columns[1].customFilterAndSearch(GLOSS.def, WORD)).toBeTruthy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[1]: senses.\nDid the senses get moved to a different column?"
      );
    }
  });

  it("Returns false when searching a word for a nonexistent gloss", () => {
    if (columns[1].customFilterAndSearch) {
      expect(
        columns[1].customFilterAndSearch(`${GLOSS.def}-NOT!`, WORD)
      ).toBeFalsy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[1]: senses.\nDid the senses get moved to a different column?"
      );
    }
  });

  // Test sorting senses
  it("Properly sorts a list by senses", () => {
    if (columns[1].customSort) {
      expect(
        [...SORT_BY_DOMAINS].sort((a, b) =>
          columns[1].customSort ? columns[1].customSort(a, b, "row") : 0
        )
      ).toEqual(SORT_BY_GLOSSES);
    } else {
      fail(
        "There is no customSort on column[1]: senses.\nDid the senses get moved to a different column?"
      );
    }
  });

  // Test searching domains
  it("Returns true when searching a word for an extant domain", () => {
    if (columns[3].customFilterAndSearch) {
      expect(columns[3].customFilterAndSearch(DOMAIN.id, WORD)).toBeTruthy();
      expect(columns[3].customFilterAndSearch(DOMAIN.name, WORD)).toBeTruthy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[3]: domains.\nDid the domains get moved to a different column?"
      );
    }
  });

  it("Returns true when searching a word for an extant domain id:name", () => {
    if (columns[3].customFilterAndSearch) {
      expect(
        columns[3].customFilterAndSearch(`${DOMAIN.id}:${DOMAIN.name}`, WORD)
      ).toBeTruthy();
      expect(
        columns[3].customFilterAndSearch(
          ` ${DOMAIN.id} : ${DOMAIN.name.toUpperCase()} `,
          WORD
        )
      ).toBeTruthy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[3]: domains.\nDid the domains get moved to a different column?"
      );
    }
  });

  it("Handles extra whitespace and different capitalization", () => {
    if (columns[3].customFilterAndSearch) {
      expect(
        columns[3].customFilterAndSearch(
          ` ${DOMAIN.id} : ${DOMAIN.name.toUpperCase()} `,
          WORD
        )
      ).toBeTruthy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[3]: domains.\nDid the domains get moved to a different column?"
      );
    }
  });

  it("Returns false when searching a word for a nonexistent domain", () => {
    if (columns[3].customFilterAndSearch) {
      expect(columns[3].customFilterAndSearch("asdfghjkl", WORD)).toBeFalsy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[3]: domains.\nDid the domains get moved to a different column?"
      );
    }
  });

  it("Returns false when searching for domain id:name that don't occur together", () => {
    if (columns[3].customFilterAndSearch) {
      expect(
        columns[3].customFilterAndSearch(`${DOMAIN.id}:${DOMAIN2.name}`, WORD)
      ).toBeFalsy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[3]: domains.\nDid the domains get moved to a different column?"
      );
    }
  });

  // Test sorting domains
  it("Properly sorts a list by domains", () => {
    if (columns[3].customSort) {
      expect(
        [...SORT_BY_GLOSSES].sort((a, b) =>
          columns[3].customSort ? columns[3].customSort(a, b, "row") : 0
        )
      ).toEqual(SORT_BY_DOMAINS);
    } else {
      fail(
        "There is no customSort on column[3]: domains.\nDid the domains get moved to a different column?"
      );
    }
  });
});
