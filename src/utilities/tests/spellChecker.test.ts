import SpellChecker from "utilities/spellChecker";

jest.mock("resources/dictionaries", () => ({
  getDict: () => Promise.resolve(`1\n${mockValidWord}`),
  getKeys: () => [],
}));

const mockValidWord = "mockWord";

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

  describe("cleanAndSplit", () => {
    // Valid word characters: \p{L} (letters), \p{M} (marks), \p{N} (numbers).
    const lWord = "Женей"; // Russian word with Cyrillic letters
    const mWord = "बंगालियों"; // Hindi word with letters and marks
    const nWord = "12345";
    const whiteSpace = "\t \n";
    const punctuation = "`~!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?";

    it("strips initial whitespace", () => {
      expect(SpellChecker.cleanAndSplit(`${whiteSpace}${lWord}`)).toEqual({
        allButFinal: "",
        final: lWord,
      });
    });

    it("strips final non-letter/-mark/-number characters", () => {
      expect(SpellChecker.cleanAndSplit(`${mWord}${whiteSpace}`)).toEqual({
        allButFinal: "",
        final: mWord,
      });
      expect(SpellChecker.cleanAndSplit(`${nWord}${punctuation}`)).toEqual({
        allButFinal: "",
        final: nWord,
      });
    });

    it("splits by non-letter/-mark/-number characters", () => {
      expect(
        SpellChecker.cleanAndSplit(`${lWord}${whiteSpace}${mWord}`)
      ).toEqual({
        allButFinal: `${lWord}${whiteSpace}`,
        final: mWord,
      });
      expect(
        SpellChecker.cleanAndSplit(`${mWord}${punctuation}${nWord}`)
      ).toEqual({
        allButFinal: `${mWord}${punctuation}`,
        final: nWord,
      });
    });
  });

  describe("getSpellingSuggestions", () => {
    it("returns suggestions", (done) => {
      const spellChecker = new SpellChecker("en");
      // Give the dictionary half-a-sec to load.
      setTimeout(() => {
        expect(
          spellChecker.getSpellingSuggestions(`${mockValidWord}`)
        ).toHaveLength(1);
        done();
      }, 500);
    });
  });
});
