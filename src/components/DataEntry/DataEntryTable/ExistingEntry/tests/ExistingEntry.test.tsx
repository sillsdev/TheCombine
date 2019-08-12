import React from "react";
import ReactDOM from "react-dom";
import {
  ExistingEntry,
  addSenseToWord,
  addSemanticDomainToSense,
  vernInFrontier,
  isADuplicate
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

  it("finds no dupliates", () => {
    let existingWords: Word[] = [];
    let vernacular: string = "vernacular";

    expect(vernInFrontier(existingWords, vernacular)).toEqual("");
  });

  it("finds a duplicate", () => {
    let word: Word = { ...mockWord };
    word.vernacular = "test";
    word.id = "1234567890";
    let existingWords: Word[] = [word];
    let vernacular: string = "test";

    expect(vernInFrontier(existingWords, vernacular)).toEqual("1234567890");
  });

  it("finds no duplicate", () => {
    let existingWords: Word[] = [];
    let word: Word = { ...mockWord };
    let vernacular: string = "vernacular";

    expect(isADuplicate(existingWords, word, vernacular)).toEqual(false);
  });

  it("determines a word is not a duplicate of itself", () => {
    let word: Word = { ...mockWord };
    word.vernacular = "test";
    word.id = "1234567890";
    let existingWords: Word[] = [word];
    let vernacular: string = "test";

    expect(isADuplicate(existingWords, word, vernacular)).toEqual(false);
  });

  it("finds a duplicate", () => {
    let dupWord: Word = { ...mockWord };
    dupWord.id = "1234567890";
    dupWord.vernacular = "test";

    let newWord: Word = { ...mockWord };
    newWord.id = "0492039";
    newWord.vernacular = "test";

    let existingWords: Word[] = [dupWord];

    expect(isADuplicate(existingWords, newWord, newWord.vernacular)).toEqual(
      true
    );
  });
});
