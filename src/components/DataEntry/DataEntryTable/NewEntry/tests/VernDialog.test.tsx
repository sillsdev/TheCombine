import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Word } from "api/models";
import StyledMenuItem from "components/DataEntry/DataEntryTable/NewEntry/StyledMenuItem";
import VernDialog, {
  VernList,
} from "components/DataEntry/DataEntryTable/NewEntry/VernDialog";
import theme from "types/theme";
import { testWordList } from "types/word";
import { defaultWritingSystem } from "types/writingSystem";

// Replace <MenuItem> with <div> to eliminate console error:
//  MUI: Unable to set focus to a MenuItem whose component has not been rendered.
jest.mock("@mui/material/MenuItem", () => "div");

let testRenderer: renderer.ReactTestRenderer;

const mockState = {
  currentProjectState: {
    project: { analysisWritingSystems: [defaultWritingSystem] },
  },
};
const mockStore = configureMockStore()(mockState);

describe("VernDialog", () => {
  it("handles empty list", () => {
    createVernDialogInstance([], true);
    const vernList = testRenderer.root.findAllByType(VernList);
    expect(vernList).toHaveLength(0);
  });
});

describe("VernList", () => {
  it("handles empty list", () => {
    createVernListInstance([], jest.fn());
    const menuItems = testRenderer.root.findAllByType(StyledMenuItem);
    expect(menuItems).toHaveLength(1);
  });

  it("closes dialog when selecting the last menu item", () => {
    const closeDialogMockCallback = jest.fn();
    const words = testWordList();
    createVernListInstance(words, closeDialogMockCallback);
    const menuItems = testRenderer.root.findAllByType(StyledMenuItem);
    expect(closeDialogMockCallback).toHaveBeenCalledTimes(0);
    menuItems[menuItems.length - 1].props.onClick();
    expect(closeDialogMockCallback).toHaveBeenCalledTimes(1);
  });

  it("has the correct number of menu items", () => {
    const words = testWordList();
    createVernListInstance(words, jest.fn());
    const menuItems = testRenderer.root.findAllByType(StyledMenuItem);
    expect(menuItems).toHaveLength(words.length + 1);
  });
});

function createVernDialogInstance(
  _vernacularWords: Word[],
  open: boolean
): void {
  renderer.act(() => {
    testRenderer = renderer.create(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <VernDialog
              vernacularWords={_vernacularWords}
              open={open}
              handleClose={jest.fn()}
              analysisLang={defaultWritingSystem.bcp47}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
}

function createVernListInstance(
  _vernacularWords: Word[],
  _mockCallback: jest.Mock
): void {
  renderer.act(() => {
    testRenderer = renderer.create(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <VernList
              vernacular="mockVern"
              vernacularWords={_vernacularWords}
              onSelect={_mockCallback}
              analysisLang={defaultWritingSystem.bcp47}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
}
