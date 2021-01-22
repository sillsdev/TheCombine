import React from "react";
import ReactDOM from "react-dom";

import { SemanticDomain } from "types/word";
import {
  ReviewEntriesWord,
  SEP_CHAR,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import mockWords from "goals/ReviewEntries/ReviewEntriesComponent/tests/MockWords";
import columns from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";

const GLOSS = "hoovy";
const DOMAIN: SemanticDomain = { name: "Person", id: "0.1" };
const DOMAIN2: SemanticDomain = { name: "Universe", id: "1" };
const WORD: ReviewEntriesWord = {
  ...new ReviewEntriesWord(),
  id: "id",
  vernacular: "pootis",
  senses: [
    {
      senseId: "sense0",
      glosses: "meaning of life" + SEP_CHAR + "life's meaning",
      domains: [DOMAIN2, { name: "Joke", id: "0.0" }],
      deleted: false,
    },
    {
      senseId: "sense1",
      glosses: "heavy noise" + SEP_CHAR + GLOSS,
      domains: [DOMAIN, { name: "Joke", id: "0" }],
      deleted: false,
    },
  ],
};

// Last sort sense is the sense that should bubble to the end, first sort sense to the front
const WORD_0 = {
  senses: [
    {
      senseId: "",
      glosses: "~",
      domains: [{ name: "", id: "7.7.6" }],
      deleted: false,
    },
  ],
};
const WORD_1 = {
  senses: [
    {
      senseId: "",
      glosses: "a",
      domains: [{ name: "", id: "9.9.9.9.9" }],
      deleted: false,
    },
  ],
};
const WORD_2 = {
  senses: [
    {
      senseId: "",
      glosses: "b",
      domains: [{ name: "", id: "0.0.0.0.0" }],
      deleted: false,
    },
  ],
};
const WORD_3 = {
  senses: [
    {
      senseId: "",
      glosses: "\0",
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
    ReactDOM.render(<div>{columns[0].render(mockWords[0])}</div>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  // Test searching senses
  it("Returns true when searching a word for an extant gloss", () => {
    if (columns[1].customFilterAndSearch !== undefined)
      expect(columns[1].customFilterAndSearch(GLOSS, WORD)).toBeTruthy();
    else
      fail(
        "There is no customFilterAndSearch on column[1]: senses.\nDid the senses get moved to a different column?"
      );
  });

  it("Returns false when searching a word for a nonexistent gloss", () => {
    if (columns[1].customFilterAndSearch)
      expect(
        columns[1].customFilterAndSearch(`${GLOSS}-NOT!`, WORD)
      ).toBeFalsy();
    else
      fail(
        "There is no customFilterAndSearch on column[1]: senses.\nDid the senses get moved to a different column?"
      );
  });

  // Test sorting senses
  it("Properly sorts a list by senses", () => {
    if (columns[1].customSort)
      expect(
        [...SORT_BY_DOMAINS].sort((a, b) =>
          columns[1].customSort ? columns[1].customSort(a, b, "row") : 0
        )
      ).toEqual(SORT_BY_GLOSSES);
    else
      fail(
        "There is no customSort on column[1]: senses.\nDid the senses get moved to a different column?"
      );
  });

  // Test searching domains
  it("Returns true when searching a word for an extant domain", () => {
    if (columns[3].customFilterAndSearch) {
      expect(columns[3].customFilterAndSearch(DOMAIN.id, WORD)).toBeTruthy();
      expect(columns[3].customFilterAndSearch(DOMAIN.name, WORD)).toBeTruthy();
    } else
      fail(
        "There is no customFilterAndSearch on column[3]: domains.\nDid the domains get moved to a different column?"
      );
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
    } else
      fail(
        "There is no customFilterAndSearch on column[3]: domains.\nDid the domains get moved to a different column?"
      );
  });

  it("Handles extra whitespace and different capitalization", () => {
    if (columns[3].customFilterAndSearch) {
      expect(
        columns[3].customFilterAndSearch(
          ` ${DOMAIN.id} : ${DOMAIN.name.toUpperCase()} `,
          WORD
        )
      ).toBeTruthy();
    } else
      fail(
        "There is no customFilterAndSearch on column[3]: domains.\nDid the domains get moved to a different column?"
      );
  });

  it("Returns false when searching a word for a nonexistent domain", () => {
    if (columns[3].customFilterAndSearch) {
      expect(columns[3].customFilterAndSearch("asdfghjkl", WORD)).toBeFalsy();
    } else
      fail(
        "There is no customFilterAndSearch on column[3]: domains.\nDid the domains get moved to a different column?"
      );
  });

  it("Returns false when searching for domain id:name that don't occur together", () => {
    if (columns[3].customFilterAndSearch) {
      expect(
        columns[3].customFilterAndSearch(`${DOMAIN.id}:${DOMAIN2.name}`, WORD)
      ).toBeFalsy();
    } else
      fail(
        "There is no customFilterAndSearch on column[3]: domains.\nDid the domains get moved to a different column?"
      );
  });

  // Test sorting domains
  it("Properly sorts a list by domains", () => {
    if (columns[3].customSort)
      expect(
        [...SORT_BY_GLOSSES].sort((a, b) =>
          columns[3].customSort ? columns[3].customSort(a, b, "row") : 0
        )
      ).toEqual(SORT_BY_DOMAINS);
    else
      fail(
        "There is no customSort on column[3]: domains.\nDid the domains get moved to a different column?"
      );
  });
});
