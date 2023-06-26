import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { Project } from "api/models";
import CharacterInventory, { CANCEL, SAVE } from "goals/CharInventoryCreation";
import { defaultState as characterInventoryState } from "goals/CharInventoryCreation/Redux/CharacterInventoryReducer";

// Constants
const mockProject = { validCharacters: ["a"] } as Project;
const mockStore = configureMockStore()({
  characterInventoryState,
  currentProjectState: { project: mockProject },
});
const UPLOAD_INV = jest.fn();

// Variables
let charMaster: renderer.ReactTestRenderer;
let charHandle: renderer.ReactTestInstance;

// This mock bypasses the fact that react-test-renderer does not support portals, with no clean solution.
// This bypasses the whole issue by replacing the portal-creating object (the Dialog) with a lightweight,
// innocuous Material-Ui component with no such glitchy properties.
jest.mock("@mui/material", () => {
  const materialUiCore = jest.requireActual("@mui/material");
  return {
    ...materialUiCore,
    Dialog: materialUiCore.Container,
  };
});

jest.mock(
  "goals/CharInventoryCreation/components/CharacterDetail",
  () => "div"
);

function renderCharInvCreation() {
  renderer.act(() => {
    charMaster = renderer.create(
      <Provider store={mockStore}>
        <CharacterInventory />
      </Provider>
    );
  });
  charHandle = charMaster.root.findByType(CharacterInventory);
}

beforeEach(() => {
  UPLOAD_INV.mockClear();
  UPLOAD_INV.mockResolvedValue(null);
  renderCharInvCreation();
});

describe("CharacterInventory", () => {
  it("renders (snapshot test)", () => {
    expect(charMaster.toJSON()).toMatchSnapshot();
  });

  it("attempts to save progress on save", () => {
    charMaster.root.findByProps({ id: SAVE }).props.onClick();

    expect(UPLOAD_INV).toHaveBeenCalledTimes(1);
  });

  it("attempts to pop up a dialogue on cancel", () => {
    charMaster.root.findByProps({ id: CANCEL }).props.onClick();

    expect(charHandle.instance.state.cancelDialogOpen).toBeTruthy();
  });

  /*it("cancels dialog open on close", () => {
    charHandle.setState({ cancelDialogOpen: true });
    charHandle.handleClose();

    expect(charHandle.instance.state.cancelDialogOpen).toBeFalsy();
  });*/
});
