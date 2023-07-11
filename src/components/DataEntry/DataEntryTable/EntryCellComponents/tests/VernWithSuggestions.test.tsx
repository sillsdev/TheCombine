import React from "react";
import renderer from "react-test-renderer";

import VernWithSuggestions from "components/DataEntry/DataEntryTable/EntryCellComponents/VernWithSuggestions";
import { newWritingSystem } from "types/writingSystem";

// A work-around for this console error: https://github.com/mui/material-ui/issues/28687#issuecomment-1513741911
jest.mock("@mui/base/node/useAutocomplete/useAutocomplete", () => () => ({
  getInputLabelProps: jest.fn(),
  getInputProps: () => ({ onMouseDown: jest.fn() }),
  getListboxProps: () => ({ ref: {} }),
  getRootProps: jest.fn(),
}));

describe("VernWithSuggestions", () => {
  it("renders with vernacular", () => {
    renderer.act(() => {
      renderer.create(
        <VernWithSuggestions
          vernacular={"vern"}
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

  it("renders new", () => {
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

  it("renders disabled", () => {
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
