import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import CharacterList from "goals/CharacterInventory/CharInv/CharacterList";
import {
  defaultState,
  newCharacterSetEntry,
} from "goals/CharacterInventory/Redux/CharacterInventoryReduxTypes";

const characterSet = ["q", "w", "e", "r", "t", "y"].map(newCharacterSetEntry);
const mockStore = configureMockStore()({
  characterInventoryState: { ...defaultState, characterSet },
});

beforeEach(async () => {
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <CharacterList />
      </Provider>
    );
  });
});

describe("CharacterList", () => {
  it("renders", () => {
    expect(screen.queryAllByRole("button")).toHaveLength(characterSet.length);
  });
});
