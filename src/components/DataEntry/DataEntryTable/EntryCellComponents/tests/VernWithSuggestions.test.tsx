import React from "react";
import renderer from "react-test-renderer";

import LocalizedVernWithSuggestions from "components/DataEntry/DataEntryTable/EntryCellComponents/VernWithSuggestions";
import { newWritingSystem } from "types/project";

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
          vernacularLang={newWritingSystem()}
          textFieldId={""}
        />
      );
    });
  });

  it("renders new without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <LocalizedVernWithSuggestions
          isNew
          vernacular={""}
          vernInput={React.createRef<HTMLDivElement>()}
          updateVernField={jest.fn()}
          handleEnterAndTab={jest.fn()}
          onBlur={jest.fn()}
          vernacularLang={newWritingSystem()}
          textFieldId={""}
        />
      );
    });
  });

  it("renders disabled without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <LocalizedVernWithSuggestions
          isDisabled
          vernacular={""}
          vernInput={React.createRef<HTMLDivElement>()}
          updateVernField={jest.fn()}
          handleEnterAndTab={jest.fn()}
          onBlur={jest.fn()}
          vernacularLang={newWritingSystem()}
          textFieldId={""}
        />
      );
    });
  });
});
