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
          updateWordId={() => null}
          allVerns={[]}
<<<<<<< HEAD
          handleEnter={() => null}
=======
          setActiveGloss={() => null}
          handleEnterAndTab={() => null}
>>>>>>> cleanup-data-entry
        />
      );
    });
  });
});
