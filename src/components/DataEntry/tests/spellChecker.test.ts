import SpellChecker from "components/DataEntry/spellChecker";

jest.mock("components/DataEntry/DataEntryHeader/DataEntryHeader");
jest.mock("components/DataEntry/DataEntryTable/DataEntryTable");
jest.mock("components/TreeView");

describe("Tests spell checker", () => {
  it("constructs properly", () => {
    const spellChecker = new SpellChecker();
    const properties = Object.keys(spellChecker);
    let hasSpellProperty = false;
    for (const property of properties) {
      if (property === "spell") {
        hasSpellProperty = true;
      }
    }
    expect(hasSpellProperty).toEqual(true);
  });

  it("correctly detects a correctly spelled word", () => {
    const spellChecker = new SpellChecker();
    const isSpelledCorrectly = spellChecker.correct("word");
    expect(isSpelledCorrectly).toEqual(true);
  });

  it("correctly detects a misspelled word", () => {
    const spellChecker = new SpellChecker();
    const isSpelledCorrectly = spellChecker.correct("abjkdsjf");
    expect(isSpelledCorrectly).toEqual(false);
  });

  it("returns an array", () => {
    const spellChecker = new SpellChecker();
    const spellingSuggestions = spellChecker.getSpellingSuggestions("abjkdsjf");
    expect(spellingSuggestions.length).toBeGreaterThanOrEqual(0);
  });
});
