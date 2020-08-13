import React from "react";
import renderer, { ReactTestInstance } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { VernList } from "../VernDialog";
import { simpleWord, Word } from "../../../../../../types/word";
import { Provider } from "react-redux";
const createMockStore = configureMockStore([]);
const mockStore = createMockStore({});
describe("Tests VernWithSuggestions", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <VernList
          vernacularWords={[simpleWord("", "")]}
          vernListRef={React.createRef()}
          closeDialog={(_selectedWord: Word) => null}
        />
      );
    });
  });
});

function createVernListInstance(
  _vernacularWords: Word[],
  _vernListRef: React.RefObject<HTMLDivElement>,
  _mockCallback: jest.Mock
): ReactTestInstance {
  return renderer.create(
    <Provider store={mockStore}>
      <VernList
        vernacularWords={_vernacularWords}
        vernListRef={_vernListRef}
        closeDialog={_mockCallback}
      />
    </Provider>
  ).root;
}
