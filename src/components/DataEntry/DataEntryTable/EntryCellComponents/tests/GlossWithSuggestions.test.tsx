import React from "react";
import renderer from "react-test-renderer";

import GlossWithSuggestions from "components/DataEntry/DataEntryTable/EntryCellComponents/GlossWithSuggestions";
import { newWritingSystem } from "types/writingSystem";

// A work-around for this console error: https://github.com/mui/material-ui/issues/28687#issuecomment-1513741911
jest.mock("@mui/base/node/useAutocomplete/useAutocomplete", () => () => ({
  getInputLabelProps: jest.fn(),
  getInputProps: () => ({ onMouseDown: jest.fn() }),
  getListboxProps: () => ({ ref: {} }),
  getRootProps: jest.fn(),
}));

describe("GlossWithSuggestions", () => {
  it("renders with gloss", () => {
    renderer.act(() => {
      renderer.create(
        <GlossWithSuggestions
          gloss={"gloss"}
          glossInput={React.createRef<HTMLInputElement>()}
          updateGlossField={jest.fn()}
          handleEnter={jest.fn()}
          analysisLang={newWritingSystem()}
          textFieldId={"test-gloss"}
        />
      );
    });
  });

  it("renders new", () => {
    renderer.act(() => {
      renderer.create(
        <GlossWithSuggestions
          isNew
          gloss={""}
          glossInput={React.createRef<HTMLInputElement>()}
          updateGlossField={jest.fn()}
          handleEnter={jest.fn()}
          analysisLang={newWritingSystem()}
          textFieldId={"test-gloss-new"}
        />
      );
    });
  });

  it("renders disabled", () => {
    renderer.act(() => {
      renderer.create(
        <GlossWithSuggestions
          isDisabled
          gloss={""}
          glossInput={React.createRef<HTMLInputElement>()}
          updateGlossField={jest.fn()}
          handleEnter={jest.fn()}
          analysisLang={newWritingSystem()}
          textFieldId={"test-gloss-disabled"}
        />
      );
    });
  });
});
