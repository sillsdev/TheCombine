import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";
import NewEntry from "components/DataEntry/DataEntryTable/NewEntry/NewEntry";

jest.mock("components/Pronunciations/Recorder");

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

describe("Tests NewEntry", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <NewEntry
            allVerns={[]}
            allWords={[]}
            defunctWordIds={[]}
            updateWordWithNewGloss={jest.fn()}
            addNewWord={jest.fn()}
            semanticDomain={{ name: "", id: "" }}
            setIsReadyState={jest.fn()}
            analysisLang={""}
          />
        </Provider>
      );
    });
  });
});
