import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { Word } from "api/models";
import { SenseList } from "components/DataEntry/DataEntryTable/NewEntry/SenseDialog";
import StyledMenuItem from "components/DataEntry/DataEntryTable/NewEntry/StyledMenuItem";
import theme from "types/theme";
import { simpleWord } from "types/word";
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
const mockWord = simpleWord("vern", "gloss");

describe("SenseList ", () => {
  it("closes dialog when selecting a menu item", () => {
    const closeDialogMockCallback = jest.fn();
    createSenseListInstance(mockWord, closeDialogMockCallback);
    const menuItem = testRenderer.root.findByProps({
      id: mockWord.senses[0].guid,
    });
    expect(closeDialogMockCallback).toHaveBeenCalledTimes(0);
    menuItem.props.onClick();
    expect(closeDialogMockCallback).toHaveBeenCalledTimes(1);
  });

  it("has the correct number of menu items", () => {
    createSenseListInstance(mockWord, jest.fn());
    const menuItems = testRenderer.root.findAllByType(StyledMenuItem);
    expect(menuItems).toHaveLength(mockWord.senses.length + 1);
  });
});

function createSenseListInstance(word: Word, closeDialog: jest.Mock): void {
  renderer.act(() => {
    testRenderer = renderer.create(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <SenseList
              analysisLang={defaultWritingSystem.bcp47}
              closeDialog={closeDialog}
              selectedWord={word}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>,
    );
  });
}
