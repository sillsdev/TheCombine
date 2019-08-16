import React from "react";
import ReactDOM from "react-dom";
import {
  ExistingEntry,
  addSenseToWord,
  addSemanticDomainToSense,
  duplicatesFromFrontier
} from "../ExistingEntry";
import { Word, SemanticDomain, State, Sense } from "../../../../../types/word";
import { mockWord } from "../../../tests/MockWord";
import SpellChecker from "../../../spellChecker";
import { mockSemanticDomain } from "../../tests/DataEntryTable.test";
import { Recorder } from "../../../../Pronunciations/Recorder";

jest.mock("../ExistingVernacular/ExistingVernacular");
jest.mock("../ExistingGloss/ExistingGloss");
jest.mock("../DeleteEntry/DeleteEntry");
jest.mock("../../../../Pronunciations/Recorder");

describe("Tests ExistingEntry", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <ExistingEntry
        wordsBeingAdded={[]}
        existingWords={[]}
        entryIndex={0}
        entry={mockWord}
        updateWord={(word: Word) => null}
        removeWord={(word: Word) => null}
        spellChecker={new SpellChecker()}
        semanticDomain={{ name: "", id: "" }}
        displayDuplicates={true}
        toggleDisplayDuplicates={() => null}
        displaySpellingSuggestions={true}
        toggleDisplaySpellingSuggestions={() => null}
        recorder={new Recorder()}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("adds a sense to a word that has no senses already", () => {
    let semanticDomain: SemanticDomain = mockSemanticDomain;
    let word: Word = mockWord;
    let gloss = "yeet";

    let newSense: Sense = {
      glosses: [{ language: "en", def: gloss }],
      semanticDomains: [semanticDomain],
      accessibility: State.active
    };

    const expectedWord: Word = {
      ...word,
      senses: [...word.senses, newSense]
    };

    expect(addSenseToWord(semanticDomain, word, gloss)).toEqual(expectedWord);
  });

  it("adds a sense to a word that already has a sense", () => {
    let semanticDomain: SemanticDomain = mockSemanticDomain;
    let existingSense: Sense = {
      glosses: [{ language: "", def: "" }],
      semanticDomains: [{ name: "domain", id: "10.2" }]
    };
    let word: Word = {
      ...mockWord,
      senses: [...mockWord.senses, existingSense]
    };
    let gloss = "yeet";
    let expectedSense: Sense = {
      glosses: [{ language: "en", def: gloss }],
      semanticDomains: [semanticDomain],
      accessibility: State.active
    };

    const expectedWord: Word = {
      ...word,
      senses: [...word.senses, expectedSense]
    };

    expect(addSenseToWord(semanticDomain, word, gloss)).toEqual(expectedWord);
  });

  it("adds a semantic domain to an existing sense", () => {
    let semanticDomain: SemanticDomain = mockSemanticDomain;
    let sense: Sense = {
      glosses: [{ language: "en", def: "yeet" }],
      semanticDomains: [],
      accessibility: State.active
    };
    let word: Word = {
      ...mockWord,
      senses: [...mockWord.senses, sense]
    };

    let senseIndex = word.senses.length - 1;

    let expectedWord: Word = {
      ...mockWord,
      senses: [
        ...mockWord.senses,
        {
          ...sense,
          semanticDomains: [semanticDomain]
        }
      ]
    };

    expect(
      addSemanticDomainToSense(semanticDomain, word, sense, senseIndex)
    ).toEqual(expectedWord);
  });

  it("finds no duplicates", () => {
    let existingWords: Word[] = [];
    let vernacular: string = "vernacular";

    expect(duplicatesFromFrontier(existingWords, vernacular, 1).length).toEqual(
      0
    );
  });

  it("finds a duplicate", () => {
    let word: Word = { ...mockWord };
    word.vernacular = "test";
    word.id = "1234567890";
    let existingWords: Word[] = [word];
    let vernacular: string = "test";

    expect(duplicatesFromFrontier(existingWords, vernacular, 1)[0]).toEqual(
      "1234567890"
    );
  });

  it("finds multiple duplicates", () => {
    let dupWord: Word = { ...mockWord };
    dupWord.id = "1234567890";
    dupWord.vernacular = "testing";

    let dupWord2: Word = { ...mockWord };
    dupWord2.id = "1234567891";
    dupWord2.vernacular = "testind";

    let newWord: Word = { ...mockWord };
    newWord.id = "0492039";
    newWord.vernacular = "testing";

    let existingWords: Word[] = [dupWord, dupWord2];
    let foundDups = duplicatesFromFrontier(
      existingWords,
      newWord.vernacular,
      2
    );

    expect(foundDups.length > 0).toEqual(true);
    expect(foundDups.length).toEqual(2);
  });

  it("finds no duplicate", () => {
    let existingWords: Word[] = [];
    let word: Word = { ...mockWord };
    let vernacular: string = "vernacular";

    expect(
      duplicatesFromFrontier(existingWords, vernacular, 1, word.id).length
    ).toEqual(0);
  });

  it("determines a word is not a duplicate of itself", () => {
    let word: Word = { ...mockWord };
    word.vernacular = "test";
    word.id = "1234567890";
    let existingWords: Word[] = [word];
    let vernacular: string = "test";

    expect(
      duplicatesFromFrontier(existingWords, vernacular, 1, word.id).length
    ).toEqual(0);
  });

  it("finds a duplicate", () => {
    let dupWord: Word = { ...mockWord };
    dupWord.id = "1234567890";
    dupWord.vernacular = "test";

    let newWord: Word = { ...mockWord };
    newWord.id = "0492039";
    newWord.vernacular = "test";

    let existingWords: Word[] = [dupWord];

    expect(
      duplicatesFromFrontier(existingWords, newWord.vernacular, 1, newWord.id)
        .length
    ).toEqual(1);
  });
});
