import React from "react";
import renderer from "react-test-renderer";

import LocalizedGlossWithSuggestions from "../GlossWithSuggestions";

describe("Tests GlossWithSuggestions", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <LocalizedGlossWithSuggestions
          gloss={""}
          glossInput={React.createRef<HTMLDivElement>()}
          updateGlossField={() => null}
          handleEnter={() => null}
        />
      );
    });
  });
});
