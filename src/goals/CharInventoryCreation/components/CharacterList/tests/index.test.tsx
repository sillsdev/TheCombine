import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { defaultState } from "goals/CharInventoryCreation/Redux/CharacterInventoryReducer";
import { newCharacterSetEntry } from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import CharacterList from "goals/CharInventoryCreation/components/CharacterList";
import CharacterCard from "goals/CharInventoryCreation/components/CharacterList/CharacterCard";

const characterSet = ["q", "w", "e", "r", "t", "y"].map(newCharacterSetEntry);
const mockStore = configureMockStore()({
  characterInventoryState: { ...defaultState, characterSet },
});

let testRenderer: renderer.ReactTestRenderer;

beforeEach(async () => {
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <CharacterList />
      </Provider>
    );
  });
});

describe("CharacterList", () => {
  it("renders", () => {
    const chars = testRenderer.root.findAllByType(CharacterCard);
    expect(chars).toHaveLength(characterSet.length);
  });
});
