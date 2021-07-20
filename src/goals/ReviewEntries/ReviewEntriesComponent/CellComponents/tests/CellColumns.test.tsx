import ReactDOM from "react-dom";

import columns from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/CellColumns";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { newDefinition, newGloss, newSemanticDomain } from "types/word";

const LANG = "en";
const DEFINITION = newDefinition("groovy", LANG);
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
      definitions: [DEFINITION],
      glosses: [
        newGloss("meaning of life", LANG),
        newGloss("life's meaning", LANG),
      ],
      domains: [DOMAIN2, DOMAIN_BAD],
      deleted: false,
    },
    {
      guid: "sense1",
      definitions: [],
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
      definitions: [newDefinition("defC")],
      glosses: [newGloss("glossD")],
      domains: [newSemanticDomain("7.7.6")],
      deleted: false,
    },
  ],
};
const WORD_1 = {
  senses: [
    {
      guid: "",
      definitions: [newDefinition("defA")],
      glosses: [newGloss("glossB")],
      domains: [newSemanticDomain("9.9.9.9.9")],
      deleted: false,
    },
  ],
};
const WORD_2 = {
  senses: [
    {
      guid: "",
      definitions: [newDefinition("defD")],
      glosses: [newGloss("glossC")],
      domains: [newSemanticDomain("0.0.0.0.0")],
      deleted: false,
    },
  ],
};
const WORD_3 = {
  senses: [
    {
      guid: "",
      definitions: [newDefinition("defB")],
      glosses: [newGloss("glossA")],
      domains: [newSemanticDomain("7.7.7")],
      deleted: false,
    },
  ],
};
const SORT_BY_DEFINIS = [WORD_1, WORD_3, WORD_0, WORD_2];
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
    const col = columns.find((c) => c.field === "senses");
    if (col?.customSort) {
      const firstWord = [...SORT_BY_GLOSSES, WORD].sort((a, b) =>
        col.customSort ? col.customSort(a, b, "row") : 0
      )[0];
      // The one with two sense comes first, since the rest have only one.
      expect(firstWord).toEqual(WORD);
    } else {
      fail();
    }
  });

  /* Definitions column */

  it("Returns true when searching a word for an extant definition", () => {
    const col = columns.find((c) => c.field === "definitions");
    if (col?.customFilterAndSearch) {
      expect(col.customFilterAndSearch(DEFINITION.text, WORD, {})).toBeTruthy();
    } else {
      fail();
    }
  });

  it("Returns false when searching a word for a nonexistent definition", () => {
    const col = columns.find((c) => c.field === "definitions");
    if (col?.customFilterAndSearch) {
      expect(col.customFilterAndSearch("c67ig-8", WORD, {})).toBeFalsy();
    } else {
      fail();
    }
  });

  it("Properly sorts a list by definitions", () => {
    const col = columns.find((c) => c.field === "definitions");
    if (col?.customSort) {
      expect(
        [...SORT_BY_DOMAINS].sort((a, b) =>
          col.customSort ? col.customSort(a, b, "row") : 0
        )
      ).toEqual(SORT_BY_DEFINIS);
    } else {
      fail();
    }
  });

  /* Glosses column */

  it("Returns true when searching a word for an extant gloss", () => {
    const col = columns.find((c) => c.field === "glosses");
    if (col?.customFilterAndSearch) {
      expect(col.customFilterAndSearch(GLOSS.def, WORD, {})).toBeTruthy();
    } else {
      fail();
    }
  });

  it("Returns false when searching a word for a nonexistent gloss", () => {
    const col = columns.find((c) => c.field === "glosses");
    if (col?.customFilterAndSearch) {
      expect(col.customFilterAndSearch("76yu*9", WORD, {})).toBeFalsy();
    } else {
      fail();
    }
  });

  it("Properly sorts a list by glosses", () => {
    const col = columns.find((c) => c.field === "glosses");
    if (col?.customSort) {
      expect(
        [...SORT_BY_DOMAINS].sort((a, b) =>
          col.customSort ? col.customSort(a, b, "row") : 0
        )
      ).toEqual(SORT_BY_GLOSSES);
    } else {
      fail();
    }
  });

  /* Domains column */

  it("Returns true when searching a word for an extant domain", () => {
    const col = columns.find((c) => c.field === "domains");
    if (col?.customFilterAndSearch) {
      expect(col.customFilterAndSearch(DOMAIN.id, WORD, {})).toBeTruthy();
      expect(col.customFilterAndSearch(DOMAIN.name, WORD, {})).toBeTruthy();
    } else {
      fail();
    }
  });

  it("Returns true when searching a word for an extant domain id:name", () => {
    const col = columns.find((c) => c.field === "domains");
    if (col?.customFilterAndSearch) {
      const filter1 = `${DOMAIN.id}:${DOMAIN.name}`;
      expect(col.customFilterAndSearch(filter1, WORD, {})).toBeTruthy();
      const filter2 = ` ${DOMAIN.id} : ${DOMAIN.name.toUpperCase()} `;
      expect(col.customFilterAndSearch(filter2, WORD, {})).toBeTruthy();
    } else {
      fail();
    }
  });

  it("Handles extra whitespace and different capitalization", () => {
    const col = columns.find((c) => c.field === "domains");
    if (col?.customFilterAndSearch) {
      const filter = ` ${DOMAIN.id} : ${DOMAIN.name.toUpperCase()} `;
      expect(col.customFilterAndSearch(filter, WORD, {})).toBeTruthy();
    } else {
      fail();
    }
  });

  it("Returns false when searching a word for a nonexistent domain", () => {
    const col = columns.find((c) => c.field === "domains");
    if (col?.customFilterAndSearch) {
      expect(col.customFilterAndSearch("asdfghjkl", WORD, {})).toBeFalsy();
    } else {
      fail();
    }
  });

  it("Returns false when searching for domain id:name that don't occur together", () => {
    const col = columns.find((c) => c.field === "glosses");
    if (col?.customFilterAndSearch) {
      const filter = `${DOMAIN.id}:${DOMAIN2.name}`;
      expect(col.customFilterAndSearch(filter, WORD, {})).toBeFalsy();
    } else {
      fail();
    }
  });

  it("Properly sorts a list by domains", () => {
    const col = columns.find((c) => c.field === "domains");
    if (col?.customSort) {
      expect(
        [...SORT_BY_GLOSSES].sort((a, b) =>
          col.customSort ? col.customSort(a, b, "row") : 0
        )
      ).toEqual(SORT_BY_DOMAINS);
    } else {
      fail();
    }
  });
});
