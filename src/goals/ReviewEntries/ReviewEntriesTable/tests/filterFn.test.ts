import * as ff from "goals/ReviewEntries/ReviewEntriesTable/filterFn";
import { newSemanticDomain } from "types/semanticDomain";
import { newDefinition, newFlag, newGloss, newPronunciation } from "types/word";

const mockGetValue = jest.fn();
const mockId = "id";
const mockRow = { getValue: mockGetValue };

describe("filterFn", () => {
  describe("filterFnDefinitions", () => {
    const filterFn = ff.filterFnDefinitions as any;
    it("trims whitespace and isn't case sensitive", () => {
      mockGetValue.mockReturnValue([
        newDefinition("hello"),
        newDefinition("WORLD"),
      ]);
      expect(filterFn(mockRow, mockId, " WoRlD\t")).toBeTruthy();
    });
  });

  describe("filterFnGlosses", () => {
    const filterFn = ff.filterFnGlosses as any;
    it("trims whitespace and isn't case sensitive", () => {
      mockGetValue.mockReturnValue([newGloss("hello"), newGloss("WORLD")]);
      expect(filterFn(mockRow, mockId, " WoRlD\t")).toBeTruthy();
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

    it("matches number of pronunciations", () => {
      mockGetValue.mockReturnValue([newPronunciation(), newPronunciation()]);
      expect(filterFn(mockRow, mockId, "  2")).toBeTruthy();
      expect(filterFn(mockRow, mockId, "2.0")).toBeTruthy();
      expect(filterFn(mockRow, mockId, "1")).toBeFalsy();
    });

    it("matches speaker name", () => {
      mockGetValue.mockReturnValue([newPronunciation("filename", speakerId)]);
      expect(filterFn(mockRow, mockId, "2")).toBeTruthy();
      expect(filterFn(mockRow, mockId, " NAME\t\t")).toBeTruthy();
      expect(filterFn(mockRow, mockId, "other person")).toBeFalsy();
    });
  });

  describe("filterFnFlag", () => {
    const filterFn = ff.filterFnFlag as any;
    it("trims whitespace and isn't case sensitive", () => {
      mockGetValue.mockReturnValue(newFlag("hello, WORLD"));
      expect(filterFn(mockRow, mockId, " WoRlD\t")).toBeTruthy();
    });

    it("doesn't match if flag not active", () => {
      mockGetValue.mockReturnValue({ active: false, text: "hi" });
      expect(filterFn(mockRow, mockId, " ")).toBeFalsy();
    });
  });
});
