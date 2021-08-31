import React from "react";
import renderer from "react-test-renderer";

import LocalizedGlossWithSuggestions from "components/DataEntry/DataEntryTable/EntryCellComponents/GlossWithSuggestions";

describe("Tests GlossWithSuggestions", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <LocalizedGlossWithSuggestions
          gloss={""}
          glossInput={React.createRef<HTMLDivElement>()}
          updateGlossField={() => null}
          handleEnterAndTab={() => null}
          analysisLang={""}
          textFieldId={""}
        />
      );
    });
  });
});
