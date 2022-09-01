import columns, {
  ColumnTitle,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellColumns";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { newSemanticDomain } from "types/semanticDomain";
import { newDefinition, newFlag, newGloss } from "types/word";
import { Bcp47Code } from "types/writingSystem";

const LANG = Bcp47Code.En;
const DEFINITION = newDefinition("groovy", LANG);
const GLOSS = newGloss("hoovy", LANG);
const DOMAIN = newSemanticDomain("1.1.3.5", "Storm");
const DOMAIN2 = newSemanticDomain("1", "Universe");
const DOMAIN_BAD = newSemanticDomain("0.0", "Joke");
const FLAG = newFlag("movie");
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
  flag: FLAG,
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
  flag: { ...newFlag(), active: true },
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
  flag: newFlag("Z is for Zebra"),
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
  flag: newFlag("A is for Aardvark"),
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
  flag: newFlag(),
};
const SORT_BY_DEFINIS = [WORD_1, WORD_3, WORD_0, WORD_2];
const SORT_BY_GLOSSES = [WORD_3, WORD_1, WORD_2, WORD_0];
const SORT_BY_DOMAINS = [WORD_2, WORD_0, WORD_3, WORD_1];
const SORT_BY_FLAGIES = [WORD_0, WORD_2, WORD_1, WORD_3];

describe("CellColumns filter and sort functions", () => {
  describe("Sense column", () => {
    const col = columns.find((c) => c.title === ColumnTitle.Senses);

    it("properly sorts a list by sense count", () => {
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
  });

  describe("Definitions column", () => {
    const col = columns.find((c) => c.title === ColumnTitle.Definitions);

    it("returns true when searching a word for an extant definition", () => {
      if (col?.customFilterAndSearch) {
        expect(
          col.customFilterAndSearch(DEFINITION.text, WORD, {})
        ).toBeTruthy();
      } else {
        fail();
      }
    });

    it("returns false when searching a word for a nonexistent definition", () => {
      if (col?.customFilterAndSearch) {
        expect(col.customFilterAndSearch("c67ig-8", WORD, {})).toBeFalsy();
      } else {
        fail();
      }
    });

    it("properly sorts a list by definitions", () => {
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
  });

  describe("Glosses column", () => {
    const col = columns.find((c) => c.title === ColumnTitle.Glosses);

    it("returns true when searching a word for an extant gloss", () => {
      if (col?.customFilterAndSearch) {
        expect(col.customFilterAndSearch(GLOSS.def, WORD, {})).toBeTruthy();
      } else {
        fail();
      }
    });

    it("returns false when searching a word for a nonexistent gloss", () => {
      if (col?.customFilterAndSearch) {
        expect(col.customFilterAndSearch("76yu*9", WORD, {})).toBeFalsy();
      } else {
        fail();
      }
    });

    it("properly sorts a list by glosses", () => {
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
  });

  describe("Domains column", () => {
    const col = columns.find((c) => c.title === ColumnTitle.Domains);

    it("returns true when searching a word for an extant domain", () => {
      if (col?.customFilterAndSearch) {
        expect(col.customFilterAndSearch(DOMAIN.id, WORD, {})).toBeTruthy();
        expect(col.customFilterAndSearch(DOMAIN.name, WORD, {})).toBeTruthy();
      } else {
        fail();
      }
    });

    it("returns true when searching for start of domain number but not end", () => {
      if (col?.customFilterAndSearch) {
        expect(
          col.customFilterAndSearch(DOMAIN.id.substring(0, 3), WORD, {})
        ).toBeTruthy();
        expect(
          col.customFilterAndSearch(DOMAIN.id.substring(2), WORD, {})
        ).toBeFalsy();
      } else {
        fail();
      }
    });

    it("returns true when searching a word for an extant domain id:name", () => {
      if (col?.customFilterAndSearch) {
        const filter1 = `${DOMAIN.id}:${DOMAIN.name}`;
        expect(col.customFilterAndSearch(filter1, WORD, {})).toBeTruthy();
        const filter2 = ` ${DOMAIN.id} : ${DOMAIN.name.toUpperCase()} `;
        expect(col.customFilterAndSearch(filter2, WORD, {})).toBeTruthy();
      } else {
        fail();
      }
    });

    it("handles extra whitespace and different capitalization", () => {
      if (col?.customFilterAndSearch) {
        const filter = ` ${DOMAIN.id} : ${DOMAIN.name.toUpperCase()} `;
        expect(col.customFilterAndSearch(filter, WORD, {})).toBeTruthy();
      } else {
        fail();
      }
    });

    it("returns false when searching a word for a nonexistent domain", () => {
      if (col?.customFilterAndSearch) {
        expect(col.customFilterAndSearch("asdfghjkl", WORD, {})).toBeFalsy();
      } else {
        fail();
      }
    });

    it("returns false when searching for domain id:name that don't occur together", () => {
      if (col?.customFilterAndSearch) {
        const filter = `${DOMAIN.id}:${DOMAIN2.name}`;
        expect(col.customFilterAndSearch(filter, WORD, {})).toBeFalsy();
      } else {
        fail();
      }
    });

    it("properly sorts a list by domains", () => {
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

  describe("Flag column", () => {
    const col = columns.find((c) => c.title === ColumnTitle.Flag);

    it("returns true when searching a word for extant flag-text", () => {
      if (col?.customFilterAndSearch) {
        expect(col.customFilterAndSearch(FLAG.text, WORD, {})).toBeTruthy();
      } else {
        fail();
      }
    });

    it("returns false when searching a word for nonexistent flag-text", () => {
      if (col?.customFilterAndSearch) {
        expect(col.customFilterAndSearch("asdfghjkl", WORD, {})).toBeFalsy();
      } else {
        fail();
      }
    });

    it("properly sorts a list by flags", () => {
      if (col?.customSort) {
        expect(
          [...SORT_BY_GLOSSES].sort((a, b) =>
            col.customSort ? col.customSort(a, b, "row") : 0
          )
        ).toEqual(SORT_BY_FLAGIES);
      } else {
        fail();
      }
    });
  });
});
