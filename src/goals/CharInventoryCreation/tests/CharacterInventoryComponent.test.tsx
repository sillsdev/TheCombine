import React from "react";
import ReactDOM, { render } from "react-dom";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import renderer, {
  ReactTestRenderer,
  ReactTestInstance
} from "react-test-renderer";
import { StoreState } from "../../../types";
import { TranslateValue } from "react-localize-redux";
import { act } from "react-dom/test-utils";
import { TextField } from "@material-ui/core";

import CharacterInventory from "../";
import { Project } from "../../../types/project";
import CharacterSet, {
  CharacterSet as CharSetClass
} from "../components/CharacterSet/CharacterSetComponent";
import { SET_CHARACTER_INVENTORY } from "../CharacterInventoryActions";

// Mock getTranslate
const MOCK_TRANSLATE = jest.fn(_ => {
  return "dummy";
});
jest.mock("react-localize-redux", () => {
  const localize = jest.requireActual("react-localize-redux");
  return {
    ...localize,
    getTranslate: jest.fn(_ => {
      return MOCK_TRANSLATE;
    })
  };
});

const createMockStore = configureMockStore([thunk]);
const state: StoreState = {
  characterInventoryState: {
    inventory: [] as string[]
  },
  currentProject: {
    id: "",
    name: "",
    semanticDomains: [],
    userRoles: "",
    vernacularWritingSystem: "",
    analysisWritingSystems: [],
    characterSet: [],
    customFields: [],
    wordFields: [],
    partsOfSpeech: [],
    words: []
  } as Project
} as StoreState;
const mockStore = createMockStore(state);

beforeAll(() => {
  mockStore.clearActions();
});

describe("Tests characterInventoryComponent", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>
        <CharacterInventory currentProject={state.currentProject} />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("Adds characters", () => {
    // Creates the tree
    let charMaster: ReactTestRenderer;
    let charHandle: ReactTestInstance;
    act(() => {
      charMaster = renderer.create(
        <Provider store={mockStore}>
          <CharacterInventory currentProject={state.currentProject} />
        </Provider>
      );
      charHandle = charMaster.root.findByType(CharSetClass);
      charHandle.instance.setState({ chars: "w" });
      charHandle.instance.addChars();
    });
    let actions = mockStore.getActions();
    expect(actions[actions.length - 1]).toEqual({
      type: SET_CHARACTER_INVENTORY,
      payload: ["w"]
    });
  });
});
