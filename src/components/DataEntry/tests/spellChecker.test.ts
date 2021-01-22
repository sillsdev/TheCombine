import SpellChecker from "components/DataEntry/spellChecker";

jest.mock("components/DataEntry/DataEntryHeader/DataEntryHeader");
jest.mock("components/DataEntry/DataEntryTable/DataEntryTable");
jest.mock("components/TreeView");

describe("Tests spell checker", () => {
  it("constructs properly", () => {
    let spellChecker: SpellChecker = new SpellChecker();
    let properties = Object.keys(spellChecker);
    let hasSpellProperty = false;
    for (let property of properties) {
      if (property === "spell") {
        hasSpellProperty = true;
      }
    }
    expect(hasSpellProperty).toEqual(true);
  });

  it("correctly detects a correctly spelled word", () => {
    let spellChecker: SpellChecker = new SpellChecker();
    let isSpelledCorrectly = spellChecker.correct("word");
    expect(isSpelledCorrectly).toEqual(true);
  });

  it("correctly detects a misspelled word", () => {
    let spellChecker: SpellChecker = new SpellChecker();
    let isSpelledCorrectly = spellChecker.correct("abjkdsjf");
    expect(isSpelledCorrectly).toEqual(false);
  });

  it("returns an array", () => {
    let spellChecker: SpellChecker = new SpellChecker();
    let spellingSuggestions: string[] = spellChecker.getSpellingSuggestions(
      "abjkdsjf"
    );
    expect(spellingSuggestions.length).toBeGreaterThanOrEqual(0);
  });
});
