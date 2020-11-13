import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "../../../../App/DefaultState";
import NewEntry from "../NewEntry";

jest.mock("../../../../Pronunciations/Recorder");

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
