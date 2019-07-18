import React from "react";
import ReactDOM from "react-dom";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import { act } from "react-dom/test-utils";

import { CharacterSet as CharSetClass } from "../CharacterSetComponent";
import CharacterSet from "../";

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
var charHandle: CharSetClass;
var originalState: any;

beforeAll(() => {
  // Creates the tree
  createTree([]);

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
      <CharacterSet
        validCharacters={[]}
        setValidCharacters={SET_VALID_CHARS}
        setRejectedCharacters={SET_REJECT_CHARS}
        rejectedCharacters={[]}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  // Add chars tests
  it("adds single character to valid characters", () => {
    testValidCharsInputWith("w");
  });

  it("adds multiple characters to valid characters", () => {
    testValidCharsInputWith("asdf");
  });

  it("adds multiple non-latin characters to valid characters", () => {
    testValidCharsInputWith("ʔʃжψض");
  });

  it("adds single character to rejected characters", () => {
    testRejectedCharsInputWith("w");
  });

  it("adds multiple characters to rejected characters", () => {
    testRejectedCharsInputWith("asdf");
  });

  it("adds multiple non-latin characters to rejected characters", () => {
    testRejectedCharsInputWith("ʔʃжψض");
  });

  // Character input tests

  // moveChar
  it("does nothing with a drag and drop equal to the same char", () => {
    var char: string = "a";
    createTree([char, "+", char]);
    charHandle.setState({ dragChar: char, dropChar: char });
    charHandle.moveChar();
    expect(SET_VALID_CHARS).toHaveBeenCalledTimes(0);
    createTree([]);
  });

  it("re-arranges the list upon drag: dragIndex < dropIndex", () => {
    var drag: string = "a";
    var drop: string = "b";
    createTree([drag, "+", drop]);
    charHandle.setState({ dragChar: drag, dropChar: drop });
    charHandle.moveChar();
    expect(SET_VALID_CHARS).toHaveBeenCalledWith(["+", drag, drop]);
    createTree([]);
  });

  it("re-arranges the list upon drag: dragIndex > dropIndex", () => {
    var drag: string = "a";
    var drop: string = "b";
    createTree([drop, "+", drag]);
    charHandle.setState({ dragChar: drag, dropChar: drop });
    charHandle.moveChar();
    expect(SET_VALID_CHARS).toHaveBeenCalledWith([drag, drop, "+"]);
    createTree([]);
  });
});

function createTree(inventory: string[]) {
  act(() => {
    charMaster = renderer.create(
      <CharacterSet
        validCharacters={inventory}
        setValidCharacters={SET_VALID_CHARS}
        setRejectedCharacters={SET_REJECT_CHARS}
        rejectedCharacters={[]}
      />
    );
  });
  charHandle = charMaster.root.findByType(CharSetClass).instance;
}

function testValidCharsInputWith(data: string) {
  let input = charMaster.root.findByProps({ id: "valid-characters-input" });
  input.props.onChange({ target: { value: data } });
  expect(SET_VALID_CHARS).toHaveBeenCalledWith(data.split(""));
}

function testRejectedCharsInputWith(data: string) {
  let input = charMaster.root.findByProps({ id: "rejected-characters-input" });
  input.props.onChange({ target: { value: data } });
  expect(SET_REJECT_CHARS).toHaveBeenCalledWith(data.split(""));
}
