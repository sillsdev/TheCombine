import SpellChecker from "utilities/spellChecker";

jest.mock("resources/dictionaries", () => ({
  getDict: () => Promise.resolve(`1\n${mockValidWord}`),
  getKeys: () => [],
}));

const mockValidWord = "mock";

describe("SpellChecker", () => {
  describe("correct", () => {
    it("detects a correctly spelled word", (done) => {
      const spellChecker = new SpellChecker("en");
      // Give the dictionary half-a-sec to load.
      setTimeout(() => {
        expect(spellChecker.correct(mockValidWord)).toEqual(true);
        done();
      }, 500);
    });

    it("detects a misspelled word", (done) => {
      const spellChecker = new SpellChecker("en");
      // Give the dictionary half-a-sec to load.
      setTimeout(() => {
        expect(spellChecker.correct("abjkdsjf")).toEqual(false);
        done();
      }, 500);
    });
  });

  describe("getSpellingSuggestions", () => {
    it("returns an array", () => {
      const spellChecker = new SpellChecker();
      const spellingSuggestions =
        spellChecker.getSpellingSuggestions("abjkdsjf");
      expect(spellingSuggestions.length).toBeGreaterThanOrEqual(0);
    });
  });
});
