import { act, render } from "@testing-library/react";
import { createRef } from "react";

import GlossWithSuggestions from "components/DataEntry/DataEntryTable/EntryCellComponents/GlossWithSuggestions";
import { newWritingSystem } from "types/writingSystem";

// A work-around for this console error: https://github.com/mui/material-ui/issues/28687#issuecomment-1513741911
jest.mock("@mui/base/node/useAutocomplete/useAutocomplete", () => ({
  useAutocomplete: () => ({
    getInputLabelProps: jest.fn(),
    getInputProps: () => ({ onMouseDown: jest.fn() }),
    getListboxProps: () => ({ ref: {} }),
    getRootProps: jest.fn(),
    groupedOptions: [],
  }),
}));

describe("GlossWithSuggestions", () => {
  it("renders with gloss", () => {
    act(() => {
      render(
        <GlossWithSuggestions
          gloss={"gloss"}
          glossInput={createRef<HTMLInputElement>()}
          updateGlossField={jest.fn()}
          handleEnter={jest.fn()}
          analysisLang={newWritingSystem()}
          textFieldId={"test-gloss"}
        />
      );
    });
  });

  it("renders new", () => {
    act(() => {
      render(
        <GlossWithSuggestions
          isNew
          gloss={""}
          glossInput={createRef<HTMLInputElement>()}
          updateGlossField={jest.fn()}
          handleEnter={jest.fn()}
          analysisLang={newWritingSystem()}
          textFieldId={"test-gloss-new"}
        />
      );
    });
  });

  it("renders disabled", () => {
    act(() => {
      render(
        <GlossWithSuggestions
          isDisabled
          gloss={""}
          glossInput={createRef<HTMLInputElement>()}
          updateGlossField={jest.fn()}
          handleEnter={jest.fn()}
          analysisLang={newWritingSystem()}
          textFieldId={"test-gloss-disabled"}
        />
      );
    });
  });
});
