import React from "react";
import renderer from "react-test-renderer";

import { Word, Sense } from "../../../../../types/word";
import { mockWord } from "../../../tests/MockWord";
import { DuplicateResolutionView } from "../DuplicateResolutionView";

describe("Tests DuplicateResolutionView", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <DuplicateResolutionView
          existingEntry={mockWord}
          newSense={""}
          addSense={(existingWord: Word, newSense: string) => null}
          addSemanticDomain={(
            existingWord: Word,
            sense: Sense,
            index: number
          ) => {}}
          duplicateInput={React.createRef<HTMLDivElement>()}
        />
      );
    });
  });
});
