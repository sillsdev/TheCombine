import React from "react";
import CharacterInventoryComponent, {
  CharacterInventory,
  SAVE,
  CANCEL
} from "../CharacterInventoryComponent";
import ReactDOM from "react-dom";
import { Project } from "../../../types/project";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import { Provider } from "react-redux";
import { store } from "../../../store";

// Constants
const SET_INV = jest.fn();
const UPLOAD_INV = jest.fn();

// Variables
var charMaster: ReactTestRenderer;
var charHandle: CharacterInventory;

// This mock bypasses the fact that react-test-renderer does not support portals, with no clean solution. This bypasses the whole issue
// by replacing the portal-creating object (the Dialog) with a lightweight, innocuous Material-Ui component with no such glitchy properties.
jest.mock("@material-ui/core", () => {
  const materialUiCore = jest.requireActual("@material-ui/core");
  return {
    ...materialUiCore,
    Dialog: materialUiCore.Container
  };
});

beforeAll(() => {
  renderer.act(() => {
    charMaster = renderer.create(
      <Provider store={store}>
        <CharacterInventoryComponent
          validCharacters={["a"]}
          currentProject={{ validCharacters: ["a"] } as Project}
          setValidCharacters={SET_INV}
          uploadInventory={UPLOAD_INV}
          addToValidCharacters={jest.fn()}
          setRejectedCharacters={jest.fn()}
          setSelectedCharacter={jest.fn()}
          fetchWords={jest.fn()}
          selectedCharacter={""}
          rejectedCharacters={[]}
        />
      </Provider>
    );
  });
  charHandle = charMaster.root.findByType(CharacterInventory).instance;
});

beforeEach(() => {
  SET_INV.mockClear();
  UPLOAD_INV.mockClear();
});

describe("Testing Character Inventory Component", () => {
  it("Renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={store}>
        <CharacterInventoryComponent
          validCharacters={["a"]}
          currentProject={{ validCharacters: ["a"] } as Project}
          setValidCharacters={SET_INV}
          uploadInventory={UPLOAD_INV}
          addToValidCharacters={jest.fn()}
          setRejectedCharacters={jest.fn()}
          setSelectedCharacter={jest.fn()}
          fetchWords={jest.fn()}
          selectedCharacter={""}
          rejectedCharacters={[]}
        />
      </Provider>,
      div
    );
    expect(ReactDOM.unmountComponentAtNode(div)).toBeTruthy();
  });

  it("Renders properly (snapshot test)", () => {
    expect(charMaster.toJSON()).toMatchSnapshot();
  });

  it("Attempts to save progress on save", () => {
    charMaster.root.findByProps({ id: SAVE }).props.onClick();

    expect(UPLOAD_INV).toHaveBeenCalledTimes(1);
  });

  it("Attempts to pop up a dialogue on cancel", () => {
    charMaster.root.findByProps({ id: CANCEL }).props.onClick();

    expect(charHandle.state.cancelDialogOpen).toBeTruthy();
  });

  it("Cancels dialog open on close", () => {
    charHandle.setState({ cancelDialogOpen: true });
    charHandle.handleClose();

    expect(charHandle.state.cancelDialogOpen).toBeFalsy();
  });
});
