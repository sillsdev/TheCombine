import React from "react";
import ReactDOM from "react-dom";
import {
  ExistingEntry,
  addSenseToWord,
  addSemanticDomainToSense,
  vernInFrontier
} from "../ExistingEntry";
import { Word, SemanticDomain, State, Sense } from "../../../../../types/word";
import { mockWord } from "../../../tests/MockWord";
import SpellChecker from "../../../spellChecker";
import { mockSemanticDomain } from "../../tests/DataEntryTable.test";

jest.mock("../ExistingVernEntry/ExistingVernEntry");
jest.mock("../ExistingGlossEntry/ExistingGlossEntry");
jest.mock("../DeleteEntry/DeleteEntry");

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

  it("correctly finds a duplicate id", () => {
    let existingWords: Word[] = [];
    let vernacular: string = "vernacular";

    expect(vernInFrontier(existingWords, vernacular)).toEqual("");
  });
});
