import React from "react";
import ReactDOM from "react-dom";
import { ExistingEntry } from "../ExistingEntry";
import { Word } from "../../../../../types/word";
import { mockWord } from "../../../tests/MockWord";
import SpellChecker from "../../../../DataEntry/spellChecker";

jest.mock("../ExistingVernEntry/ExistingVernEntry");
jest.mock("../ExistingGlossEntry/ExistingGlossEntry");
jest.mock("../DeleteEntry/DeleteEntry");

describe("Tests ExistingEntry", () => {
  it("renders without crashing when not displaying tooltip", () => {
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
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
