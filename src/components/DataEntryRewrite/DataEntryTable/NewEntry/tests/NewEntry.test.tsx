import React from "react";
import ReactDOM from "react-dom";
import { NewEntry } from "../NewEntry";
import { Word } from "../../../../../types/word";

jest.mock("../NewVernEntry/NewVernEntry");
jest.mock("../NewGlossEntry/NewGlossEntry");

describe("Tests NewEntry", () => {
  it("renders without crashing when not displaying tooltip", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <NewEntry
        allWords={[]}
        updateWord={(updatedWord: Word) => null}
        addNewWord={(newWord: Word) => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
