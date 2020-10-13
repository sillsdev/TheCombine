import React from "react";
import { Provider } from "react-redux";
import renderer, { ReactTestInstance } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { VernList, StyledMenuItem } from "../VernDialog";
import { simpleWord, Word, testWordList } from "../../../../../types/word";

jest.mock(
  "../../../../../goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell"
);
jest.mock(
  "../../../../../goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCell"
);
const createMockStore = configureMockStore([]);
const mockStore = createMockStore({});

describe("Tests VernList ", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <VernList
          vernacularWords={[simpleWord("", "")]}
          closeDialog={jest.fn()}
          analysisLang={"en"}
        />
      );
    });
  });

  it("closes dialog when selecting a menu item", () => {
    let closeDialogMockCallback = jest.fn();
    let words = testWordList();
    const instance = createVernListInstance(words, closeDialogMockCallback);
    let menuItem = instance.findByProps({ id: words[0].id });
    expect(closeDialogMockCallback).toHaveBeenCalledTimes(0);
    menuItem.props.onClick();
    expect(closeDialogMockCallback).toHaveBeenCalledTimes(1);
  });

  it("has the correct amout of menu items", () => {
    let words = testWordList();
    const instance = createVernListInstance(words, jest.fn());
    let menuItemsCount = instance.findAllByType(StyledMenuItem).length;
    expect(words.length + 1).toBe(menuItemsCount);
  });
});

function createVernListInstance(
  _vernacularWords: Word[],
  _mockCallback: jest.Mock
): ReactTestInstance {
  return renderer.create(
    <Provider store={mockStore}>
      <VernList
        vernacularWords={_vernacularWords}
        closeDialog={_mockCallback}
        analysisLang={"en"}
      />
    </Provider>
  ).root;
}
