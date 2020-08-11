import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "../../../../App/DefaultState";
import { NewEntry } from "../NewEntry";

jest.mock("../../../../Pronunciations/Recorder");
jest.mock("../../GlossWithSuggestions/GlossWithSuggestions");
jest.mock("../NewVernEntry/NewVernEntry");

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

describe("Tests NewEntry", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <NewEntry
            allWords={[]}
            updateWord={() => null}
            addNewWord={() => null}
            semanticDomain={{ name: "", id: "" }}
            setIsReadyState={() => null}
          />
        </Provider>
      );
    });
  });
});
