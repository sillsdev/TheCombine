import React from "react";
import ReactDOM from "react-dom";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import { StoreState } from "../../../../../types";
import { act } from "react-dom/test-utils";

import { Project } from "../../../../../types/project";
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
const SET_INV = jest.fn();
const DATA = "dat";

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
  SET_INV.mockClear();

  // Reset tree
  charHandle.setState(originalState);
});

describe("Tests characterInventoryComponent", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <CharacterSet validCharacters={[]} setInventory={SET_INV} />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  // Add chars tests
  it("Adds single character", () => {
    testAddCharsWith("w");
  });

  it("Adds multiple characters", () => {
    testAddCharsWith("asdf");
  });

  it("Adds multiple non-latin characters", () => {
    testAddCharsWith("ʔʃжψض");
  });

  it("Appends data to the end of the list", () => {
    createTree(["y", "a"]);
    charHandle.setState({ chars: "ck" });
    charHandle.addChars();
    expect(SET_INV).toHaveBeenCalledWith(["y", "a", "c", "k"]);
  });

  it("Errors out when attempting to call addChars without any data", () => {
    charHandle.setState({ chars: "" });
    charHandle.addChars();

    expect(SET_INV).toHaveBeenCalledTimes(0);
    expect(charHandle.state.textboxError).toBeTruthy();
    expect(charHandle.state.chars).toEqual("");
  });

  // Handle change tests
  it("Clears error + adds chars when calling handleChange", () => {
    charHandle.setState({ chars: "", textboxError: true });
    charHandle.handleChange({ target: { value: DATA } } as any);

    expect(charHandle.state.chars).toBe(DATA);
    expect(charHandle.state.textboxError).toBeFalsy();
  });

  it("Removes whitespace on addChars", () => {
    charHandle.handleChange({ target: { value: DATA + " \n\t" } } as any);
    expect(charHandle.state.chars).toBe(DATA);
  });

  // Handle key down tests
  it("Calls addChars properly on handleKeyDown", () => {
    // Temporarily mock out addChars
    const REAL = CharSetClass.prototype.addChars;
    const MOCK = jest.fn();
    CharSetClass.prototype.addChars = MOCK;

    // Test
    charHandle.handleKeyDown({ key: "Not enter" } as any);
    expect(MOCK).toHaveBeenCalledTimes(0);
    MOCK.mockClear();

    charHandle.handleKeyDown({ key: "Enter" } as any);
    expect(MOCK).toHaveBeenCalledTimes(1);

    // Fix CharSetClass
    CharSetClass.prototype.addChars = REAL;
  });

  // moveChar

  // toggleSelected test
  it("Toggles an unselected char", () => {
    charHandle.toggleSelected("a");
    expect(charHandle.state.selected).toEqual(["a"]);
  });

  it("Un-toggles a selected char", () => {
    charHandle.setState({ selected: ["a"] });
    charHandle.toggleSelected("a");
    expect(charHandle.state.selected).toEqual([]);
  });

  it("Un-toggles a selected char without removing other chars", () => {
    charHandle.setState({ selected: ["a", "v"] });
    charHandle.toggleSelected("a");
    expect(charHandle.state.selected).toEqual(["v"]);
  });

  // deleteSelected test
  it("Deletes a selected char", () => {
    // Setup
    createTree(["q", "w", "e", "r", "t", "y"]);
    charHandle.setState({
      selected: ["q", "e", "r", "y"]
    });

    charHandle.deleteSelected();
    expect(SET_INV).toHaveBeenCalledWith(["w", "t"]);

    // Cleanup
    createTree([]);
  });

  // moveChar
  it("Does nothing with a drag and drop equal to the same char", () => {
    var char: string = "a";
    createTree([char, "+", char]);
    charHandle.setState({ dragChar: char, dropChar: char });
    charHandle.moveChar();
    expect(SET_INV).toHaveBeenCalledTimes(0);
    createTree([]);
  });

  it("Re-arranges the list upon drag: dragIndex < dropIndex", () => {
    var drag: string = "a";
    var drop: string = "b";
    createTree([drag, "+", drop]);
    charHandle.setState({ dragChar: drag, dropChar: drop });
    charHandle.moveChar();
    expect(SET_INV).toHaveBeenCalledWith(["+", drag, drop]);
    createTree([]);
  });

  it("Re-arranges the list upon drag: dragIndex > dropIndex", () => {
    var drag: string = "a";
    var drop: string = "b";
    createTree([drop, "+", drag]);
    charHandle.setState({ dragChar: drag, dropChar: drop });
    charHandle.moveChar();
    expect(SET_INV).toHaveBeenCalledWith([drag, drop, "+"]);
    createTree([]);
  });
});

function createTree(inventory: string[]) {
  act(() => {
    charMaster = renderer.create(
      <CharacterSet validCharacters={inventory} setInventory={SET_INV} />
    );
  });
  charHandle = charMaster.root.findByType(CharSetClass).instance;
}

function testAddCharsWith(data: string) {
  charHandle.setState({ chars: data });
  charHandle.addChars();

  expect(SET_INV).toHaveBeenCalledWith(data.split(""));
  expect(charHandle.state.chars).toEqual("");
}

function dragAndDropChar(
  drag: string,
  drop: string,
  resultantInventory: any[]
) {
  createTree([drag, "+", drop]);
  charHandle.setState({ dragChar: drag, dropChar: drop });
  charHandle.moveChar();
  expect(SET_INV).toHaveBeenCalledWith(resultantInventory);
  createTree([]);
}
