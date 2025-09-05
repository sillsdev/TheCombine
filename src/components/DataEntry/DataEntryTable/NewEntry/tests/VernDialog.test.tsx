import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactElement } from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { Word } from "api/models";
import VernDialog, {
  VernList,
} from "components/DataEntry/DataEntryTable/NewEntry/VernDialog";
import { defaultState } from "rootRedux/types";
import theme from "types/theme";
import { testWordList } from "types/word";
import { defaultWritingSystem } from "types/writingSystem";

const mockOnSelect = jest.fn();
const mockStore = configureMockStore()(defaultState);

describe("VernDialog", () => {
  it("handles empty list", async () => {
    await renderOpenVernDialog([]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("has the correct number of menu items", async () => {
    const words = testWordList();
    await renderOpenVernDialog(words);
    expect(screen.queryAllByRole("menuitem")).toHaveLength(words.length + 1);
  });
});

describe("VernList", () => {
  it("handles empty list", async () => {
    await renderVernList([]);
    expect(screen.queryAllByRole("menuitem")).toHaveLength(1);
  });

  it("triggers onSelect when selecting the last menu item", async () => {
    await renderVernList(testWordList());
    const menuItems = screen.queryAllByRole("menuitem");
    expect(mockOnSelect).toHaveBeenCalledTimes(0);
    await userEvent.click(menuItems[menuItems.length - 1]);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it("has the correct number of menu items", async () => {
    const words = testWordList();
    await renderVernList(words);
    expect(screen.queryAllByRole("menuitem")).toHaveLength(words.length + 1);
  });
});

async function renderElemWithProviders(elem: ReactElement): Promise<void> {
  await act(async () => {
    render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>{elem}</Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
}

async function renderOpenVernDialog(vernacularWords: Word[]): Promise<void> {
  await renderElemWithProviders(
    <VernDialog
      analysisLang={defaultWritingSystem.bcp47}
      handleClose={jest.fn()}
      open
      vernacularWords={vernacularWords}
    />
  );
}

async function renderVernList(vernacularWords: Word[]): Promise<void> {
  await renderElemWithProviders(
    <VernList
      analysisLang={defaultWritingSystem.bcp47}
      onSelect={mockOnSelect}
      vernacular="mockVern"
      vernacularWords={vernacularWords}
    />
  );
}
