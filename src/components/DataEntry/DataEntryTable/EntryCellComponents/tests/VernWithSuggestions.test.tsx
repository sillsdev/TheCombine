import { act, render } from "@testing-library/react";
import { createRef } from "react";

import VernWithSuggestions from "components/DataEntry/DataEntryTable/EntryCellComponents/VernWithSuggestions";
import { newWritingSystem } from "types/writingSystem";

// A work-around for this console error: https://github.com/mui/material-ui/issues/28687#issuecomment-1513741911
jest.mock("@mui/material/useAutocomplete/useAutocomplete", () => ({
  useAutocomplete: () => ({
    getInputLabelProps: jest.fn(),
    getInputProps: () => ({ onMouseDown: jest.fn() }),
    getListboxProps: () => ({ ref: {} }),
    getRootProps: jest.fn(),
    groupedOptions: [],
  }),
}));

describe("VernWithSuggestions", () => {
  it("renders with vernacular", () => {
    act(() => {
      render(
        <VernWithSuggestions
          vernacular={"vern"}
          vernInput={createRef<HTMLInputElement>()}
          updateVernField={jest.fn()}
          handleEnter={jest.fn()}
          onBlur={jest.fn()}
          vernacularLang={newWritingSystem()}
          textFieldId={"test-vern"}
        />
      );
    });
  });

  it("renders new", () => {
    act(() => {
      render(
        <VernWithSuggestions
          isNew
          vernacular={""}
          vernInput={createRef<HTMLInputElement>()}
          updateVernField={jest.fn()}
          handleEnter={jest.fn()}
          onBlur={jest.fn()}
          vernacularLang={newWritingSystem()}
          textFieldId={"test-vern-new"}
        />
      );
    });
  });

  it("renders disabled", () => {
    act(() => {
      render(
        <VernWithSuggestions
          isDisabled
          vernacular={""}
          vernInput={createRef<HTMLInputElement>()}
          updateVernField={jest.fn()}
          handleEnter={jest.fn()}
          onBlur={jest.fn()}
          vernacularLang={newWritingSystem()}
          textFieldId={"test-vern-disabled"}
        />
      );
    });
  });
});
