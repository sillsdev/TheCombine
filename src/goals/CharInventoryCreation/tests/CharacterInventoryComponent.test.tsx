import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Project } from "api/models";
import CharacterInventory, {
  CANCEL,
  SAVE,
} from "goals/CharInventoryCreation/CharacterInventoryComponent";
import { defaultState as characterInventoryState } from "goals/CharInventoryCreation/Redux/CharacterInventoryReducer";
import { CreateCharInv } from "goals/CreateCharInv/CreateCharInv";

// Constants
const mockStore = configureMockStore()({ characterInventoryState });
const SET_INV = jest.fn();
const UPLOAD_INV = jest.fn();

// Variables
var charMaster: ReactTestRenderer;
var charHandle: CharacterInventory;

// This mock bypasses the fact that react-test-renderer does not support portals, with no clean solution.
// This bypasses the whole issue by replacing the portal-creating object (the Dialog) with a lightweight,
// innocuous Material-Ui component with no such glitchy properties.
jest.mock("@material-ui/core", () => {
  const materialUiCore = jest.requireActual("@material-ui/core");
  return {
    ...materialUiCore,
    Dialog: materialUiCore.Container,
  };
});

function renderCharInvCreation() {
  renderer.act(() => {
    charMaster = renderer.create(
      <Provider store={mockStore}>
        <CharacterInventory
          goal={new CreateCharInv()}
          currentProject={{ validCharacters: ["a"] } as Project}
          setValidCharacters={SET_INV}
          uploadInventory={UPLOAD_INV}
          setRejectedCharacters={jest.fn()}
          setSelectedCharacter={jest.fn()}
          getAllCharacters={jest.fn(() => Promise.resolve())}
          fetchWords={jest.fn()}
          selectedCharacter={""}
          allCharacters={[]}
          resetInState={jest.fn()}
          exit={jest.fn()}
        />
      </Provider>
    );
  });
  charHandle = charMaster.root.findByType(CharacterInventory).instance;
}

beforeEach(() => {
  SET_INV.mockClear();
  UPLOAD_INV.mockClear();
  UPLOAD_INV.mockResolvedValue(null);
  renderCharInvCreation();
});

describe("Character Inventory Component", () => {
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
