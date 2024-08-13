import SpellChecker from "utilities/spellChecker";

jest.mock("resources/dictionaries", () => ({
  getDict: () => Promise.resolve(`2\n${mockValidWordA}\n${mockValidWordBExt}`),
  getKeys: () => [],
}));

const invalidWord = "asdfghjkl";
const mockWord = "mockWord";
const mockValidWordA = `${mockWord}A`;
const mockWordB = `${mockWord}B`;
const mockWordC = `${mockWord}C`;
const mockValidWordBExt = `${mockWordB}Extended`;

describe("SpellChecker", () => {
  describe("correct", () => {
    it("detects a correctly spelled word", (done) => {
      const spellChecker = new SpellChecker("en");
      // Give the dictionary half-a-sec to load.
      setTimeout(() => {
        expect(spellChecker.correct(mockValidWordA)).toEqual(true);
        done();
      }, 500);
    });

    it("detects a misspelled word", (done) => {
      const spellChecker = new SpellChecker("en");
      // Give the dictionary half-a-sec to load.
      setTimeout(() => {
        expect(spellChecker.correct(invalidWord)).toEqual(false);
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
      expect(
        SpellChecker.cleanAndSplit(`${whiteSpace}${punctuation}${lWord}`)
      ).toEqual({
        allButFinal: punctuation,
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
    it("returns nothing for gibberish", (done) => {
      const spellChecker = new SpellChecker("en");
      // Give the dictionary half-a-sec to load.
      setTimeout(() => {
        const suggestions = spellChecker.getSpellingSuggestions(invalidWord);
        expect(suggestions).toHaveLength(0);
        done();
      }, 500);
    });

    it("returns spelling correction", (done) => {
      const spellChecker = new SpellChecker("en");
      // Give the dictionary half-a-sec to load.
      setTimeout(() => {
        const suggestions = spellChecker.getSpellingSuggestions(mockWordC);
        // Returns suggestion with 1 letter different.
        expect(suggestions).toContain(mockValidWordA);
        // Don't return lookahead for word 1 letter different.
        expect(suggestions).not.toContain(mockValidWordBExt);
        done();
      }, 500);
    });

    it("returns spelling correction and lookahead", (done) => {
      const spellChecker = new SpellChecker("en");
      // Give the dictionary half-a-sec to load.
      setTimeout(() => {
        const suggestions = spellChecker.getSpellingSuggestions(mockWordB);
        // Returns suggestion with 1 letter different.
        expect(suggestions).toContain(mockValidWordA);
        // Returns suggestions with many letters added.
        expect(suggestions).toContain(mockValidWordBExt);
        done();
      }, 500);
    });
  });

  describe("replaceAllButLastWordWithEllipses", () => {
    it("handles empty string", () => {
      expect(SpellChecker.replaceAllButLastWordWithEllipses("")).toEqual("");
    });

    it("does nothing if only 1 word", () => {
      const word = " *(- #/;-something";
      const result = SpellChecker.replaceAllButLastWordWithEllipses(word);
      expect(result).toEqual(word);
    });

    it("replaces with ellipses when multiple words", () => {
      expect(
        SpellChecker.replaceAllButLastWordWithEllipses("double-word")
      ).toEqual("...-word");

      expect(
        SpellChecker.replaceAllButLastWordWithEllipses("now 3 words")
      ).toEqual("... words");

      expect(
        SpellChecker.replaceAllButLastWordWithEllipses("paren before (end")
      ).toEqual("...(end");
    });
  });
});
