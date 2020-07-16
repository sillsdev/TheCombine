import React from "react";
import renderer from "react-test-renderer";

import LocalizedGlossEntry from "../GlossEntry";

describe("Tests GlossEntry", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <LocalizedGlossEntry
          gloss={""}
          glossInput={React.createRef<HTMLDivElement>()}
          updateGlossField={(newValue: string) => null}
        />
      );
    });
  });
});
