import React from "react";
import renderer from "react-test-renderer";

import LocalizedVernWithSuggestions from "../VernWithSuggestions";

describe("Tests VernWithSuggestions", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <LocalizedVernWithSuggestions
          vernacular={""}
          vernInput={React.createRef<HTMLDivElement>()}
          updateVernField={() => []}
          setActiveGloss={() => null}
          updateWordId={() => null}
          allVerns={[]}
          handleEnterAndTab={() => null}
          analysisLang={"en"}
        />
      );
    });
  });
});
