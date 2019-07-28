import React from "react";
import ReactDOM from "react-dom";
import { ExistingEntry } from "../ExistingEntry";
import { Word, State } from "../../../../../types/word";

const mockWord: Word = {
  id: "",
  vernacular: "",
  senses: [
    {
      glosses: [
        {
          language: "en",
          def: ""
        }
      ],
      semanticDomains: []
    }
  ],
  audio: "",
  created: "",
  modified: "",
  history: [],
  partOfSpeech: "",
  editedBy: [],
  accessability: State.active,
  otherField: "",
  plural: ""
};

jest.mock("../ExistingVernEntry/ExistingVernEntry");
jest.mock("../ExistingGlossEntry/ExistingGlossEntry");
jest.mock("../DeleteEntry/DeleteEntry");

describe("Tests ExistingEntry", () => {
  it("renders without crashing when not displaying tooltip", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <ExistingEntry
        allWords={[]}
        entryIndex={0}
        entry={mockWord}
        updateWord={(word: Word) => null}
        removeWord={(id: string) => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
