import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import CharInv, {
  buttonIdCancel,
  buttonIdSave,
  dialogButtonIdNo,
  dialogButtonIdYes,
  dialogIdCancel,
} from "goals/CharacterInventory/CharInv";
import { defaultState as characterInventoryState } from "goals/CharacterInventory/Redux/CharacterInventoryReducer";

// Replace Dialog with something that doesn't create portals,
// because react-test-renderer does not support portals.
jest.mock("@mui/material", () => {
  const materialUiCore = jest.requireActual("@mui/material");
  return {
    ...materialUiCore,
    Dialog: materialUiCore.Container,
  };
});

jest.mock("goals/CharacterInventory/CharInv/CharacterDetail", () => "div");
jest.mock("goals/CharacterInventory/Redux/CharacterInventoryActions", () => ({
  exit: () => mockExit(),
  loadCharInvData: () => mockLoadCharInvData(),
  resetInState: () => jest.fn(),
  setSelectedCharacter: () => mockSetSelectedCharacter(),
  uploadInventory: () => mockUploadInventory(),
}));
jest.mock("types/hooks", () => {
  return {
    ...jest.requireActual("types/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const mockExit = jest.fn();
const mockLoadCharInvData = jest.fn();
const mockSetSelectedCharacter = jest.fn();
const mockUploadInventory = jest.fn();

let charMaster: renderer.ReactTestRenderer;

const mockStore = configureMockStore()({ characterInventoryState });

function renderCharInvCreation() {
  renderer.act(() => {
    charMaster = renderer.create(
      <Provider store={mockStore}>
        <CharInv />
      </Provider>
    );
  });
}

beforeEach(() => {
  jest.resetAllMocks();
  renderCharInvCreation();
});

describe("CharInv", () => {
  it("loads data on render", () => {
    expect(mockLoadCharInvData).toHaveBeenCalledTimes(1);
  });

  it("saves inventory on save", async () => {
    expect(mockUploadInventory).toHaveBeenCalledTimes(0);
    const saveButton = charMaster.root.findByProps({ id: buttonIdSave });
    await renderer.act(async () => saveButton.props.onClick());
    expect(mockUploadInventory).toHaveBeenCalledTimes(1);
  });

  it("opens a dialogue on cancel, closes on no", () => {
    const cancelDialog = charMaster.root.findByProps({ id: dialogIdCancel });
    expect(cancelDialog.props.open).toBeFalsy();

    const cancelButton = charMaster.root.findByProps({ id: buttonIdCancel });
    renderer.act(() => cancelButton.props.onClick());
    expect(cancelDialog.props.open).toBeTruthy();

    const noButton = charMaster.root.findByProps({ id: dialogButtonIdNo });
    renderer.act(() => noButton.props.onClick());
    expect(cancelDialog.props.open).toBeFalsy();
  });

  it("exits on cancel-yes", () => {
    const cancelButton = charMaster.root.findByProps({ id: buttonIdCancel });
    renderer.act(() => cancelButton.props.onClick());
    expect(mockExit).toBeCalledTimes(0);

    const yesButton = charMaster.root.findByProps({ id: dialogButtonIdYes });
    renderer.act(() => yesButton.props.onClick());
    expect(mockExit).toBeCalledTimes(1);
  });
});
