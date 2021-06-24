import ReactDOM from "react-dom";

import columns from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { newGloss, newSemanticDomain } from "types/word";

const LANG = "en";
const GLOSS = newGloss("hoovy", LANG);
const DOMAIN = newSemanticDomain("0.1", "Person");
const DOMAIN2 = newSemanticDomain("1", "Universe");
const DOMAIN_BAD = newSemanticDomain("0.0", "Joke");
const WORD: ReviewEntriesWord = {
  ...new ReviewEntriesWord(),
  id: "id",
  vernacular: "pootis",
  senses: [
    {
      guid: "sense0",
      glosses: [
        newGloss("meaning of life", LANG),
        newGloss("life's meaning", LANG),
      ],
      domains: [DOMAIN2, DOMAIN_BAD],
      deleted: false,
    },
    {
      guid: "sense1",
      glosses: [newGloss("heavy noise", LANG), GLOSS],
      domains: [DOMAIN, DOMAIN_BAD],
      deleted: false,
    },
  ],
};

// Last sort sense is the sense that should bubble to the end, first sort sense to the front
const WORD_0 = {
  senses: [
    {
      guid: "",
      glosses: [newGloss("~", LANG)],
      domains: [newSemanticDomain("7.7.6")],
      deleted: false,
    },
  ],
};
const WORD_1 = {
  senses: [
    {
      guid: "",
      glosses: [newGloss("a", LANG)],
      domains: [newSemanticDomain("9.9.9.9.9")],
      deleted: false,
    },
  ],
};
const WORD_2 = {
  senses: [
    {
      guid: "",
      glosses: [newGloss("b", LANG)],
      domains: [newSemanticDomain("0.0.0.0.0")],
      deleted: false,
    },
  ],
};
const WORD_3 = {
  senses: [
    {
      guid: "",
      glosses: [newGloss("\0", LANG)],
      domains: [newSemanticDomain("7.7.7")],
      deleted: false,
    },
  ],
};
const SORT_BY_GLOSSES = [WORD_3, WORD_1, WORD_2, WORD_0];
const SORT_BY_DOMAINS = [WORD_2, WORD_0, WORD_3, WORD_1];

describe("Tests cell column functions", () => {
  /* Vernacular column */

  // Vernacular doesn't just return another object, and thus is render-tested here.
  it("Renders vernacular without crashing", () => {
    const div = document.createElement("div");
    if (columns[0].render) {
      ReactDOM.render(<div>{columns[0].render(WORD, "row")}</div>, div);
      ReactDOM.unmountComponentAtNode(div);
    } else {
      fail(
        "There is no render on column[0].\nDid the vernacular get moved to a different column?"
      );
    }
  });

  /* Sense column */

  it("Properly sorts a list by sense count", () => {
    if (columns[1].customSort) {
      const firstWord = [...SORT_BY_GLOSSES, WORD].sort((a, b) =>
        columns[1].customSort ? columns[1].customSort(a, b, "row") : 0
      )[0];
      // The one with two sense comes first, since the rest have only one.
      expect(firstWord).toEqual(WORD);
    } else {
      fail(
        "There is no customSort on column[1].\nDid the senses get moved to a different column?"
      );
    }
  });

  /* Glosses column */

  it("Returns true when searching a word for an extant gloss", () => {
    if (columns[2].customFilterAndSearch) {
      expect(columns[2].customFilterAndSearch(GLOSS.def, WORD)).toBeTruthy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[2].\nDid the glosses get moved to a different column?"
      );
    }
  });

  it("Returns false when searching a word for a nonexistent gloss", () => {
    if (columns[2].customFilterAndSearch) {
      expect(
        columns[2].customFilterAndSearch(`${GLOSS.def}-NOT!`, WORD)
      ).toBeFalsy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[2].\nDid the glosses get moved to a different column?"
      );
    }
  });

  it("Properly sorts a list by glosses", () => {
    if (columns[2].customSort) {
      expect(
        [...SORT_BY_DOMAINS].sort((a, b) =>
          columns[2].customSort ? columns[2].customSort(a, b, "row") : 0
        )
      ).toEqual(SORT_BY_GLOSSES);
    } else {
      fail(
        "There is no customSort on column[2].\nDid the glosses get moved to a different column?"
      );
    }
  });

  /* Domains column */

  it("Returns true when searching a word for an extant domain", () => {
    if (columns[3].customFilterAndSearch) {
      expect(columns[3].customFilterAndSearch(DOMAIN.id, WORD)).toBeTruthy();
      expect(columns[3].customFilterAndSearch(DOMAIN.name, WORD)).toBeTruthy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[3].\nDid the domains get moved to a different column?"
      );
    }
  });

  it("Returns true when searching a word for an extant domain id:name", () => {
    if (columns[3].customFilterAndSearch) {
      const filter1 = `${DOMAIN.id}:${DOMAIN.name}`;
      expect(columns[3].customFilterAndSearch(filter1, WORD)).toBeTruthy();
      const filter2 = ` ${DOMAIN.id} : ${DOMAIN.name.toUpperCase()} `;
      expect(columns[3].customFilterAndSearch(filter2, WORD)).toBeTruthy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[3].\nDid the domains get moved to a different column?"
      );
    }
  });

  it("Handles extra whitespace and different capitalization", () => {
    if (columns[3].customFilterAndSearch) {
      const filter = ` ${DOMAIN.id} : ${DOMAIN.name.toUpperCase()} `;
      expect(columns[3].customFilterAndSearch(filter, WORD)).toBeTruthy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[3].\nDid the domains get moved to a different column?"
      );
    }
  });

  it("Returns false when searching a word for a nonexistent domain", () => {
    if (columns[3].customFilterAndSearch) {
      expect(columns[3].customFilterAndSearch("asdfghjkl", WORD)).toBeFalsy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[3].\nDid the domains get moved to a different column?"
      );
    }
  });

  it("Returns false when searching for domain id:name that don't occur together", () => {
    if (columns[3].customFilterAndSearch) {
      const filter = `${DOMAIN.id}:${DOMAIN2.name}`;
      expect(columns[3].customFilterAndSearch(filter, WORD)).toBeFalsy();
    } else {
      fail(
        "There is no customFilterAndSearch on column[3].\nDid the domains get moved to a different column?"
      );
    }
  });

  it("Properly sorts a list by domains", () => {
    if (columns[3].customSort) {
      expect(
        [...SORT_BY_GLOSSES].sort((a, b) =>
          columns[3].customSort ? columns[3].customSort(a, b, "row") : 0
        )
      ).toEqual(SORT_BY_DOMAINS);
    } else {
      fail(
        "There is no customSort on column[3].\nDid the domains get moved to a different column?"
      );
    }
  });
});
