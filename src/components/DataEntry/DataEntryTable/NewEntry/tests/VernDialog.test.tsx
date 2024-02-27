import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "localization/mocks/reactI18nextMock";

import { Word } from "api/models";
import StyledMenuItem from "components/DataEntry/DataEntryTable/NewEntry/StyledMenuItem";
import { VernList } from "components/DataEntry/DataEntryTable/NewEntry/VernDialog";
import theme from "types/theme";
import { testWordList } from "types/word";
import { defaultWritingSystem } from "types/writingSystem";

// Replace <MenuItem> with <div> to eliminate console error:
//  MUI: Unable to set focus to a MenuItem whose component has not been rendered.
jest.mock("@mui/material/MenuItem", () => "div");

jest.mock("goals/ReviewEntries/ReviewEntriesTable/CellComponents", () => ({
  DomainCell: () => <div />,
  GlossCell: () => <div />,
  PartOfSpeechCell: () => <div />,
}));

let testRenderer: renderer.ReactTestRenderer;

const mockState = {
  currentProjectState: {
    project: { analysisWritingSystems: [defaultWritingSystem] },
  },
};
const mockStore = configureMockStore()(mockState);

describe("VernList ", () => {
  it("closes dialog when selecting a menu item", () => {
    const closeDialogMockCallback = jest.fn();
    const words = testWordList();
    createVernListInstance(words, closeDialogMockCallback);
    const menuItem = testRenderer.root.findByProps({ id: words[0].id });
    expect(closeDialogMockCallback).toHaveBeenCalledTimes(0);
    menuItem.props.onClick();
    expect(closeDialogMockCallback).toHaveBeenCalledTimes(1);
  });

  it("has the correct number of menu items", () => {
    const words = testWordList();
    createVernListInstance(words, jest.fn());
    const menuItems = testRenderer.root.findAllByType(StyledMenuItem);
    expect(menuItems).toHaveLength(words.length + 1);
  });
});

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
              vernacularWords={_vernacularWords}
              closeDialog={_mockCallback}
              analysisLang={defaultWritingSystem.bcp47}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
}
