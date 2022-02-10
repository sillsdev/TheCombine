import React from "react";
import renderer from "react-test-renderer";

import { WritingSystem } from "api/models";
import LocalizedGlossWithSuggestions from "components/DataEntry/DataEntryTable/EntryCellComponents/GlossWithSuggestions";

describe("Tests GlossWithSuggestions", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <LocalizedGlossWithSuggestions
          gloss={""}
          glossInput={React.createRef<HTMLDivElement>()}
          updateGlossField={jest.fn()}
          handleEnterAndTab={jest.fn()}
          analysisLang={{} as WritingSystem}
          textFieldId={""}
        />
      );
    });
  });

  it("renders new without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <LocalizedGlossWithSuggestions
          isNew
          gloss={""}
          glossInput={React.createRef<HTMLDivElement>()}
          updateGlossField={jest.fn()}
          handleEnterAndTab={jest.fn()}
          analysisLang={{} as WritingSystem}
          textFieldId={""}
        />
      );
    });
  });

  it("renders disabled without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <LocalizedGlossWithSuggestions
          isDisabled
          gloss={""}
          glossInput={React.createRef<HTMLDivElement>()}
          updateGlossField={jest.fn()}
          handleEnterAndTab={jest.fn()}
          analysisLang={{} as WritingSystem}
          textFieldId={""}
        />
      );
    });
  });
});
