import React from "react";
import renderer from "react-test-renderer";

import { WritingSystem } from "api/models";
import GlossWithSuggestions from "components/DataEntry/DataEntryTable/EntryCellComponents/GlossWithSuggestions";

describe("Tests GlossWithSuggestions", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <GlossWithSuggestions
          gloss={""}
          glossInput={React.createRef<HTMLDivElement>()}
          updateGlossField={jest.fn()}
          handleEnterAndTab={jest.fn()}
          analysisLang={{} as WritingSystem}
          textFieldId={"test-gloss"}
        />
      );
    });
  });

  it("renders new without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <GlossWithSuggestions
          isNew
          gloss={""}
          updateGlossField={jest.fn()}
          handleEnterAndTab={jest.fn()}
          analysisLang={{} as WritingSystem}
          textFieldId={"test-gloss-new"}
        />
      );
    });
  });

  it("renders disabled without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <GlossWithSuggestions
          isDisabled
          gloss={""}
          updateGlossField={jest.fn()}
          handleEnterAndTab={jest.fn()}
          analysisLang={{} as WritingSystem}
          textFieldId={"test-gloss-disabled"}
        />
      );
    });
  });
});
