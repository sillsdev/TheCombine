import React from "react";
import renderer from "react-test-renderer";

import { simpleWord, Word } from "../../../../../types/word";
import { DuplicateResolutionView } from "../DuplicateResolutionView";

const mockWord: Word = simpleWord("", "");

describe("Tests DuplicateResolutionView", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <DuplicateResolutionView
          existingEntry={mockWord}
          newSense={""}
          addSense={() => null}
          addSemanticDomain={() => {}}
          duplicateInput={React.createRef<HTMLDivElement>()}
        />
      );
    });
  });
});
