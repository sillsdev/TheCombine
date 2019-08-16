import React from "react";
import ReactDOM from "react-dom";
import { NewEntry } from "../NewEntry";
import { Word } from "../../../../../types/word";
import SpellChecker from "../../../spellChecker";

jest.mock("../NewVernEntry/NewVernEntry");
jest.mock("../NewGlossEntry/NewGlossEntry");

describe("Tests NewEntry", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <NewEntry
        allWords={[]}
        updateWord={(updatedWord: Word) => null}
        addNewWord={(newWord: Word) => null}
        spellChecker={new SpellChecker()}
        semanticDomain={{ name: "", id: "" }}
        displayDuplicates={true}
        toggleDisplayDuplicates={() => null}
        displaySpellingSuggestions={true}
        toggleDisplaySpellingSuggestions={() => null}
        setIsReadyState={() => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
