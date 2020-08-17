import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "../../../../App/DefaultState";
import NewEntry from "../NewEntry";

jest.mock("../../../../Pronunciations/Recorder");
jest.mock("../../GlossWithSuggestions/GlossWithSuggestions");
jest.mock("../../VernWithSuggestions/VernWithSuggestions");

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
            addNewWord={() => new Promise(() => {})}
            updateWordWithNewGloss={() => new Promise(() => {})}
            semanticDomain={{ name: "", id: "" }}
            setIsReadyState={() => null}
            analysisLang={""}
          />
        </Provider>
      );
    });
  });
});
