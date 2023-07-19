import SpellChecker from "utilities/spellChecker";

jest.mock(
  "utilities/dictionary",
  () => () => Promise.resolve({ aff: "SET UTF-8", dic: `1\n${mockValidWord}` })
);

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

  it("getSpellingSuggestions returns an array", () => {
    const spellChecker = new SpellChecker();
    const spellingSuggestions = spellChecker.getSpellingSuggestions("abjkdsjf");
    expect(spellingSuggestions.length).toBeGreaterThanOrEqual(0);
  });
});
