import React from "react";
import ReactDOM from "react-dom";
import { DuplicateResolutionView } from "../DuplicateResolutionView";
import { Word } from "../../../../../types/word";
import { mockWord } from "../../../tests/MockWord";

describe("Tests DeleteEntry", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <DuplicateResolutionView
        existingEntry={mockWord}
        newSense={""}
        addSense={(existingWord: Word, newSense: string) => null}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
