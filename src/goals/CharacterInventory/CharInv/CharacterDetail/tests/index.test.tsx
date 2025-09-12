import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import CharacterDetail from "goals/CharacterInventory/CharInv/CharacterDetail";
import { FindAndReplaceId } from "goals/CharacterInventory/CharInv/CharacterDetail/FindAndReplace";
import { defaultState } from "goals/CharacterInventory/Redux/CharacterInventoryReduxTypes";
import { type StoreState } from "rootRedux/types";

jest.mock("goals/CharacterInventory/Redux/CharacterInventoryActions", () => ({
  findAndReplace: () => mockFindAndReplace(),
}));
jest.mock("rootRedux/hooks", () => {
  return {
    ...jest.requireActual("rootRedux/hooks"),
    useAppDispatch: () => (args: any) => Promise.resolve(args),
  };
});

const mockClose = jest.fn();
const mockFindAndReplace = jest.fn();

const mockChar = "#";
// mockPrefix is a single character whose only appearance in the component
// is in an example of a word containing the mockChar.
const mockPrefix = "@";
const mockWord = mockPrefix + mockChar;
const mockState: Partial<StoreState> = {
  characterInventoryState: { ...defaultState, allWords: [mockWord] },
};
const mockStore = configureMockStore()(mockState);

async function renderCharacterDetail(): Promise<void> {
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <CharacterDetail character={mockChar} close={mockClose} />
      </Provider>
    );
  });
}

beforeEach(async () => {
  jest.resetAllMocks();
  await renderCharacterDetail();
});

describe("CharacterDetail", () => {
  it("renders with example word", () => {
    expect(screen.queryByText(mockPrefix)).toBeTruthy();
  });

  describe("FindAndReplace", () => {
    it("only submits after confirmation", async () => {
      const submitButton = screen.getByTestId(FindAndReplaceId.ButtonSubmit);

      await userEvent.click(submitButton);
      await userEvent.click(screen.getByTestId(FindAndReplaceId.ButtonCancel));
      await userEvent.click(submitButton);
      expect(mockFindAndReplace).not.toHaveBeenCalled();
      await userEvent.click(screen.getByTestId(FindAndReplaceId.ButtonConfirm));
      expect(mockFindAndReplace).toHaveBeenCalled();
    });
  });
});
