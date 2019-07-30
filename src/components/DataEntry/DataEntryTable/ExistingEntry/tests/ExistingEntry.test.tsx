import React from "react";
import ReactDOM from "react-dom";
import { ExistingEntry } from "../ExistingEntry";
import { Word } from "../../../../../types/word";
import { mockWord } from "../../../tests/MockWord";
import SpellChecker from "../../../spellChecker";

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
        removeWord={(id: string) => null}
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
});
