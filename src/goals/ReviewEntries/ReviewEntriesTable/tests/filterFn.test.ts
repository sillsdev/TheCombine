import * as ff from "goals/ReviewEntries/ReviewEntriesTable/filterFn";
import { newSemanticDomain } from "types/semanticDomain";
import { newDefinition, newFlag, newGloss, newPronunciation } from "types/word";

const mockGetValue = jest.fn();
const mockId = "id";
const mockRow = { getValue: mockGetValue };

describe("filterFn", () => {
  describe("isQuoted", () => {
    const quotedStrings = [
      "'Single quotes'",
      '"Double quotes"',
      "“Angled quotes”",
      "‹Single-bracket quotes›",
      "«Double-bracket quotes»",
    ];
    test("With quotes", () => {
      quotedStrings.forEach((s) => expect(ff.isQuoted(s)).toBeTruthy());
    });

    const unquotedStrings = [
      "",
      "hi",
      '"',
      "'Single-quote start",
      "“Angled-quote start",
      "Angle-quote end”",
    ];
    test("Without quotes", () => {
      unquotedStrings.forEach((s) => expect(ff.isQuoted(s)).toBeFalsy());
    });
  });

  describe("fuzzyContains", () => {
    const testString = "I am a string with many possible substrings.";

    test("short: no typos allowed", () => {
      ["i", "am", "a s"].forEach((s) =>
        expect(ff.fuzzyContains(testString, s)).toBeTruthy()
      );
      ["@", "aq"].forEach((s) =>
        expect(ff.fuzzyContains(testString, s)).toBeFalsy()
      );
    });

    test("medium: 1 typo allowed", () => {
      ["i b", "ama", "strim"].forEach((s) =>
        expect(ff.fuzzyContains(testString, s)).toBeTruthy()
      );
      ["i'm", "astrr"].forEach((s) =>
        expect(ff.fuzzyContains(testString, s)).toBeFalsy()
      );
    });

    test("long: 2 typos allowed", () => {
      ["i'm a string", "with man88"].forEach((s) =>
        expect(ff.fuzzyContains(testString, s)).toBeTruthy()
      );
      ["i'm a ztring", "with man888"].forEach((s) =>
        expect(ff.fuzzyContains(testString, s)).toBeFalsy()
      );
    });
  });

  describe("matchesFilter", () => {
    const value = "Hello world!";
    const filterWithTypo = "H3llo";
    const filterWrongCase = "HELLO";
    const filterExact = "Hello";

    it("unquoted: trims whitespace, fuzzy match", () => {
      expect(ff.matchesFilter(value, "goodbye")).toBeFalsy();
      expect(ff.matchesFilter(value, `  ${filterWithTypo}`)).toBeTruthy();
      expect(ff.matchesFilter(value, `${filterWrongCase}\t`)).toBeTruthy();
      expect(ff.matchesFilter(value, `\t${filterExact}  `)).toBeTruthy();
    });

    it("quoted: trims whitespace, exact match", () => {
      expect(ff.matchesFilter(value, `"${filterWithTypo}"`)).toBeFalsy();
      expect(ff.matchesFilter(value, `"${filterWrongCase}"`)).toBeFalsy();
      expect(ff.matchesFilter(value, ` "\t${filterExact} "\n`)).toBeTruthy();
    });
  });

  describe("filterFnString", () => {
    const filterFn = ff.filterFnString as any;
    beforeEach(() => {
      mockGetValue.mockReturnValue("Hello world!");
    });

    it("unquoted: trims whitespace, fuzzy match", () => {
      expect(filterFn(mockRow, mockId, "goodbye")).toBeFalsy();
      expect(filterFn(mockRow, mockId, "  H3LLO")).toBeTruthy();
    });

    it("quoted: trims whitespace, exact match", () => {
      expect(filterFn(mockRow, mockId, '"H3llo"')).toBeFalsy();
      expect(filterFn(mockRow, mockId, '"HELLO"')).toBeFalsy();
      expect(filterFn(mockRow, mockId, '" Hello"\n')).toBeTruthy();
    });
  });

  describe("filterFnDefinitions", () => {
    const filterFn = ff.filterFnDefinitions as any;
    beforeEach(() => {
      mockGetValue.mockReturnValue([
        newDefinition("hello"),
        newDefinition("WORLD"),
      ]);
    });

    it("unquoted: trims whitespace, fuzzy match", () => {
      expect(filterFn(mockRow, mockId, "earth")).toBeFalsy();
      expect(filterFn(mockRow, mockId, " wrld\t")).toBeTruthy();
    });

    it("quoted: trims whitespace, exact match", () => {
      expect(filterFn(mockRow, mockId, '"h3llo"')).toBeFalsy();
      expect(filterFn(mockRow, mockId, '"HELLO"')).toBeFalsy();
      expect(filterFn(mockRow, mockId, '" hello"\n')).toBeTruthy();
    });
  });

  describe("filterFnGlosses", () => {
    const filterFn = ff.filterFnGlosses as any;
    beforeEach(() => {
      mockGetValue.mockReturnValue([newGloss("hello"), newGloss("WORLD")]);
    });

    it("unquoted: trims whitespace, fuzzy match", () => {
      expect(filterFn(mockRow, mockId, "earth")).toBeFalsy();
      expect(filterFn(mockRow, mockId, " wrld\t")).toBeTruthy();
    });

    it("quoted: trims whitespace, exact match", () => {
      expect(filterFn(mockRow, mockId, '"h3llo"')).toBeFalsy();
      expect(filterFn(mockRow, mockId, '"HELLO"')).toBeFalsy();
      expect(filterFn(mockRow, mockId, '" hello"\n')).toBeTruthy();
    });
  });

  describe("filterFnDomains", () => {
    const filterFn = ff.filterFnDomains as any;

    it("whitespace matches everything with a domain", () => {
      mockGetValue.mockReturnValue([]);
      expect(filterFn(mockRow, mockId, " ")).toBeFalsy();

      mockGetValue.mockReturnValue([newSemanticDomain()]);
      expect(filterFn(mockRow, mockId, " ")).toBeTruthy();
    });

    it("non-whitespace without . or digits matches nothing", () => {
      const filterValue = "just letters!";
      mockGetValue.mockReturnValue([
        newSemanticDomain("1.1"),
        newSemanticDomain("9.9.9", filterValue),
        newSemanticDomain(),
      ]);
      expect(filterFn(mockRow, mockId, filterValue)).toBeFalsy();
    });

    it("ignores characters aside from . and digits", () => {
      mockGetValue.mockReturnValue([newSemanticDomain("2")]);
      expect(filterFn(mockRow, mockId, "2: Person")).toBeTruthy();
      expect(filterFn(mockRow, mockId, "abc2de")).toBeTruthy();
    });

    it("periods are optional", () => {
      mockGetValue.mockReturnValue([newSemanticDomain("2.2.2")]);
      expect(filterFn(mockRow, mockId, "..22.....2")).toBeTruthy();
    });

    it("final periods allow for initial id matches", () => {
      mockGetValue.mockReturnValue([newSemanticDomain("1.2.3")]);
      expect(filterFn(mockRow, mockId, ".")).toBeTruthy();
      expect(filterFn(mockRow, mockId, "1.")).toBeTruthy();
      expect(filterFn(mockRow, mockId, "12.")).toBeTruthy();
      expect(filterFn(mockRow, mockId, "2.")).toBeFalsy();
    });
  });

  describe("filterFnPronunciations", () => {
    const speakerId = "speaker-id";
    const speakers = { [speakerId]: "name with number 2" };
    // filterFnPronunciations returns a filter function when given a speaker dictionary
    const filterFn = (ff.filterFnPronunciations as any)(speakers);

    it("numeric: matches number of pronunciations", () => {
      mockGetValue.mockReturnValue([newPronunciation(), newPronunciation()]);
      expect(filterFn(mockRow, mockId, "  2")).toBeTruthy();
      expect(filterFn(mockRow, mockId, "2.0")).toBeTruthy();
      expect(filterFn(mockRow, mockId, "1")).toBeFalsy();
    });

    it("whitespace: matches any audio", () => {
      mockGetValue.mockReturnValueOnce([]);
      expect(filterFn(mockRow, mockId, " ")).toBeFalsy();
      mockGetValue.mockReturnValueOnce([newPronunciation()]);
      expect(filterFn(mockRow, mockId, " ")).toBeTruthy();
    });

    it("unquoted: fuzzy-matches speaker name", () => {
      mockGetValue.mockReturnValue([newPronunciation("filename", speakerId)]);
      expect(filterFn(mockRow, mockId, "2")).toBeTruthy();
      expect(filterFn(mockRow, mockId, " NAME\t\t")).toBeTruthy();
      expect(filterFn(mockRow, mockId, "numb3r")).toBeTruthy();
      expect(filterFn(mockRow, mockId, "other person")).toBeFalsy();
    });

    it("quoted: exact-matches speaker name", () => {
      mockGetValue.mockReturnValue([newPronunciation("filename", speakerId)]);
      expect(filterFn(mockRow, mockId, "'2'")).toBeTruthy();
      expect(filterFn(mockRow, mockId, "'NAME'")).toBeFalsy();
      expect(filterFn(mockRow, mockId, " '\tname ' \t")).toBeTruthy();
    });
  });

  describe("filterFnFlag", () => {
    const filterFn = ff.filterFnFlag as any;
    beforeEach(() => {
      mockGetValue.mockReturnValue(newFlag("Hello world!"));
    });

    it("unquoted: trims whitespace, fuzzy match", () => {
      expect(filterFn(mockRow, mockId, "goodbye")).toBeFalsy();
      expect(filterFn(mockRow, mockId, "  H3LLO")).toBeTruthy();
    });

    it("quoted: trims whitespace, exact match", () => {
      expect(filterFn(mockRow, mockId, '"H3llo"')).toBeFalsy();
      expect(filterFn(mockRow, mockId, '"HELLO"')).toBeFalsy();
      expect(filterFn(mockRow, mockId, ' "\tHello "\n')).toBeTruthy();
    });

    it("doesn't match if flag not active", () => {
      const text = "hi";

      mockGetValue.mockReturnValueOnce({ active: true, text });
      expect(filterFn(mockRow, mockId, text)).toBeTruthy();

      mockGetValue.mockReturnValueOnce({ active: false, text });
      expect(filterFn(mockRow, mockId, text)).toBeFalsy();
    });
  });
});
