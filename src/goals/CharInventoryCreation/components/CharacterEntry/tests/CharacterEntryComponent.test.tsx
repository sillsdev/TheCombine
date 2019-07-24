import React from "react";
import ReactDOM from "react-dom";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import { act } from "react-dom/test-utils";

import CharacterEntry, {
  CharacterEntry as CE
} from "../CharacterEntryComponent";
//import CharacterEntry from "..";

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

// Constants
const SET_VALID_CHARS = jest.fn();
const SET_REJECT_CHARS = jest.fn();

// Handles
var charMaster: ReactTestRenderer;
var charHandle: CE;
var originalState: any;

beforeAll(() => {
  // Creates the tree
  createTree();

  // Save default values
  originalState = { ...charHandle.state };
});

beforeEach(() => {
  SET_VALID_CHARS.mockClear();
  SET_VALID_CHARS.mockClear();

  // Reset tree
  charHandle.setState(originalState);
});

describe("Tests characterInventoryComponent", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <CharacterEntry
        setValidCharacters={jest.fn()}
        setRejectedCharacters={jest.fn()}
        validCharacters={[]}
        rejectedCharacters={[]}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});

function createTree() {
  act(() => {
    charMaster = renderer.create(
      <CharacterEntry
        setValidCharacters={jest.fn()}
        setRejectedCharacters={jest.fn()}
        validCharacters={[]}
        rejectedCharacters={[]}
      />
    );
  });
  charHandle = charMaster.root.findByType(CharacterEntry).instance;
}
