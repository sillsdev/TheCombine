import React from "react";
import renderer from "react-test-renderer";

import LocalizedVernWithSuggestions from "components/DataEntry/DataEntryTable/EntryCellComponents/VernWithSuggestions";

describe("Tests VernWithSuggestions", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <LocalizedVernWithSuggestions
          vernacular={""}
          vernInput={React.createRef<HTMLDivElement>()}
          updateVernField={jest.fn()}
          handleEnterAndTab={jest.fn()}
          onBlur={jest.fn()}
        />
      );
    });
  });
});
