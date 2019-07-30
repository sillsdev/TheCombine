import React from "react";

import columns from "../CellColumns";
import mockWords from "../../tests/MockWords";
import { ReviewEntriesWord, SEP_CHAR } from "../../ReviewEntriesComponent";
import { SemanticDomain } from "../../../../../types/word";
import ReactDOM from "react-dom";

const GLOSS = "hoovy";
const DOMAIN: SemanticDomain = { name: "Person", id: "0.1" };
const WORD: ReviewEntriesWord = {
  id: "id",
  vernacular: "pootis",
  senses: [
    {
      senseId: "sense0",
      glosses: "meaning of life" + SEP_CHAR + "life's meaning",
      domains: [{ name: "Universe", id: "1" }, { name: "Joke", id: "0.0" }],
      deleted: false
    },
    {
      senseId: "sense1",
      glosses: "heavy noise" + SEP_CHAR + GLOSS,
      domains: [DOMAIN, { name: "Joke", id: "0" }],
      deleted: false
    }
  ]
};
const VERN_NDX = 0;
const SENSE_NDX = 1;
const DOMAIN_NDX = 2;

// Last sort sense is the sense that should bubble to the end, first sort sense to the front
const LAST_SORT_WORD = {
  senses: [
    {
      senseId: "",
      glosses: "~",
      domains: [{ name: "~", id: "~" }],
      deleted: false
    }
  ]
};
const FIRST_SORT_WORD = {
  senses: [
    {
      senseId: "",
      glosses: "\0",
      domains: [{ name: "\0", id: "\0" }],
      deleted: false
    }
  ]
};

// Note to user: VSCode reports a number of errors in this file; these are, however, erroneous. They pertain to checking a value in an array
// at a position specified by a constant, then (if it existed) calling that function. Thanks to the index not being a literal, though, VSCode
// isn't certain that it confirms that the function exists, even though the constant could not physically change between the two points.
// The test runs fine, though.
describe("Tests cell column functions", () => {
  // Vernacular is the only one which isn't just returning another object, and thus the only one tested here
  it("Renders vernacular without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<div>{columns[VERN_NDX].render(mockWords[0])}</div>, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  // Test searching senses
  it("Returns true when searching a word for an extant gloss", () => {
    if (columns[SENSE_NDX].customFilterAndSearch !== undefined)
      expect(
        columns[SENSE_NDX].customFilterAndSearch(GLOSS, WORD)
      ).toBeTruthy();
    else
      fail(
        `There is no customFilterAndSearch on column[${SENSE_NDX}]: senses.\nDid the senses get moved to a different column?`
      );
  });

  it("Returns false when searching a word for an extant gloss", () => {
    if (columns[SENSE_NDX].customFilterAndSearch)
      expect(
        columns[SENSE_NDX].customFilterAndSearch(`${GLOSS}-NOT!`, WORD)
      ).toBeFalsy();
    else
      fail(
        `There is no customFilterAndSearch on column[${SENSE_NDX}]: senses.\nDid the senses get moved to a different column?`
      );
  });

  // Test sorting senses
  it("Returns proper values for sense custom sort", () => {
    if (columns[SENSE_NDX].customSort) {
      expect(
        columns[SENSE_NDX].customSort(FIRST_SORT_WORD, LAST_SORT_WORD, "row")
      ).toBeLessThan(0);
      expect(
        columns[SENSE_NDX].customSort(LAST_SORT_WORD, FIRST_SORT_WORD, "row")
      ).toBeGreaterThan(0);
      expect(
        columns[SENSE_NDX].customSort(FIRST_SORT_WORD, FIRST_SORT_WORD, "row")
      ).toEqual(0);
    } else
      fail(
        `There is no customSort on column[${SENSE_NDX}]: senses.\nDid the senses get moved to a different column?`
      );
  });

  // Test searching domains
  it("Returns true when searching a word for an extant domain", () => {
    if (columns[DOMAIN_NDX].customFilterAndSearch) {
      expect(
        columns[DOMAIN_NDX].customFilterAndSearch(DOMAIN.id, WORD)
      ).toBeTruthy();
      expect(
        columns[DOMAIN_NDX].customFilterAndSearch(DOMAIN.name, WORD)
      ).toBeTruthy();
    } else
      fail(
        `There is no customFilterAndSearch on column[${DOMAIN_NDX}]: domains.\nDid the domains get moved to a different column?`
      );
  });

  it("Returns true when searching a word for an extant domain", () => {
    if (columns[DOMAIN_NDX].customFilterAndSearch) {
      expect(
        columns[DOMAIN_NDX].customFilterAndSearch(GLOSS, WORD)
      ).toBeFalsy();
    } else
      fail(
        `There is no customFilterAndSearch on column[${DOMAIN_NDX}]: domains.\nDid the domains get moved to a different column?`
      );
  });

  // Test sorting domains
  it("Returns proper values for sense custom sort", () => {
    if (columns[DOMAIN_NDX].customSort) {
      expect(
        columns[DOMAIN_NDX].customSort(FIRST_SORT_WORD, LAST_SORT_WORD, "row")
      ).toBeLessThan(0);
      expect(
        columns[DOMAIN_NDX].customSort(LAST_SORT_WORD, FIRST_SORT_WORD, "row")
      ).toBeGreaterThan(0);
      expect(
        columns[DOMAIN_NDX].customSort(FIRST_SORT_WORD, FIRST_SORT_WORD, "row")
      ).toEqual(0);
    } else
      fail(
        `There is no customSort on column[${DOMAIN_NDX}]: domains.\nDid the domains get moved to a different column?`
      );
  });
});
