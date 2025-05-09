import { Provider } from "react-redux";
import { ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import CharInv from "goals/CharacterInventory/CharInv";
import { CharInvCancelSaveIds } from "goals/CharacterInventory/CharInv/CharacterEntry";
import { defaultState as characterInventoryState } from "goals/CharacterInventory/Redux/CharacterInventoryReduxTypes";

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
  reset: () => jest.fn(),
  setSelectedCharacter: () => mockSetSelectedCharacter(),
  uploadInventory: () => mockUploadInventory(),
}));
jest.mock("rootRedux/hooks", () => {
  return {
    ...jest.requireActual("rootRedux/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const mockExit = jest.fn();
const mockLoadCharInvData = jest.fn();
const mockSetSelectedCharacter = jest.fn();
const mockUploadInventory = jest.fn();

let charMaster: ReactTestRenderer;

const mockStore = configureMockStore()({ characterInventoryState });

async function renderCharInvCreation(): Promise<void> {
  await act(async () => {
    charMaster = create(
      <Provider store={mockStore}>
        <CharInv />
      </Provider>
    );
  });
}

beforeEach(async () => {
  jest.resetAllMocks();
  await renderCharInvCreation();
});

describe("CharInv", () => {
  it("loads data on render", () => {
    expect(mockLoadCharInvData).toHaveBeenCalledTimes(1);
  });

  it("saves inventory on save", async () => {
    expect(mockUploadInventory).toHaveBeenCalledTimes(0);
    const saveButton = charMaster.root.findByProps({
      id: CharInvCancelSaveIds.ButtonSave,
    });
    await act(async () => saveButton.props.onClick());
    expect(mockUploadInventory).toHaveBeenCalledTimes(1);
  });

  it("opens a dialogue on cancel, closes on no", async () => {
    const cancelDialog = charMaster.root.findByProps({
      id: CharInvCancelSaveIds.DialogCancel,
    });
    expect(cancelDialog.props.open).toBeFalsy();

    const cancelButton = charMaster.root.findByProps({
      id: CharInvCancelSaveIds.ButtonCancel,
    });
    await act(async () => cancelButton.props.onClick());
    expect(cancelDialog.props.open).toBeTruthy();

    const noButton = charMaster.root.findByProps({
      id: CharInvCancelSaveIds.DialogCancelButtonNo,
    });
    await act(async () => noButton.props.onClick());
    expect(cancelDialog.props.open).toBeFalsy();
  });

  it("exits on cancel-yes", async () => {
    const cancelButton = charMaster.root.findByProps({
      id: CharInvCancelSaveIds.ButtonCancel,
    });
    await act(async () => cancelButton.props.onClick());
    expect(mockExit).toHaveBeenCalledTimes(0);

    const yesButton = charMaster.root.findByProps({
      id: CharInvCancelSaveIds.DialogCancelButtonYes,
    });
    await act(async () => yesButton.props.onClick());
    expect(mockExit).toHaveBeenCalledTimes(1);
  });
});
