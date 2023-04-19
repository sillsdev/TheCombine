import React from "react";
import renderer from "react-test-renderer";

import VernWithSuggestions from "components/DataEntry/DataEntryTable/EntryCellComponents/VernWithSuggestions";
import { newWritingSystem } from "types/writingSystem";

describe("Tests VernWithSuggestions", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <VernWithSuggestions
          vernacular={""}
          vernInput={React.createRef<HTMLDivElement>()}
          updateVernField={jest.fn()}
          handleEnterAndTab={jest.fn()}
          onBlur={jest.fn()}
          vernacularLang={newWritingSystem()}
          textFieldId={"test-vern"}
        />
      );
    });
  });

  it("renders new without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <VernWithSuggestions
          isNew
          vernacular={""}
          vernInput={React.createRef<HTMLDivElement>()}
          updateVernField={jest.fn()}
          handleEnterAndTab={jest.fn()}
          onBlur={jest.fn()}
          vernacularLang={newWritingSystem()}
          textFieldId={"test-vern-new"}
        />
      );
    });
  });

  it("renders disabled without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <VernWithSuggestions
          isDisabled
          vernacular={""}
          vernInput={React.createRef<HTMLDivElement>()}
          updateVernField={jest.fn()}
          handleEnterAndTab={jest.fn()}
          onBlur={jest.fn()}
          vernacularLang={newWritingSystem()}
          textFieldId={"test-vern-disabled"}
        />
      );
    });
  });
});
