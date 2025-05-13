import { ReactTestRenderer, act, create } from "react-test-renderer";

import DeleteButtonWithDialog from "components/Buttons/DeleteButtonWithDialog";
import { CancelConfirmDialog } from "components/Dialogs";

// Dialog uses portals, which are not supported in react-test-renderer.
jest.mock("@mui/material/Dialog", () =>
  jest.requireActual("@mui/material/Container")
);

const mockDelete = jest.fn();
const buttonId = "button-id";
const buttonIdCancel = "button-id-cancel";
const buttonIdConfirm = "button-id-confirm";
const textId = "text-id";

let cellHandle: ReactTestRenderer;

const renderDeleteCell = async (): Promise<void> => {
  await act(async () => {
    cellHandle = create(
      <DeleteButtonWithDialog
        buttonId={buttonId}
        buttonIdCancel={buttonIdCancel}
        buttonIdConfirm={buttonIdConfirm}
        delete={mockDelete}
        textId={textId}
      />
    );
  });
};

beforeEach(async () => {
  jest.clearAllMocks();
  await renderDeleteCell();
});

describe("DeleteCell", () => {
  it("has working dialog buttons", async () => {
    const dialog = cellHandle.root.findByType(CancelConfirmDialog);
    const deleteButton = cellHandle.root.findByProps({ id: buttonId });

    expect(dialog.props.open).toBeFalsy();
    await act(async () => {
      deleteButton.props.onClick();
    });
    expect(dialog.props.open).toBeTruthy();
    const cancelButton = cellHandle.root.findByProps({ id: buttonIdCancel });
    await act(async () => {
      cancelButton.props.onClick();
    });
    expect(dialog.props.open).toBeFalsy();
    await act(async () => {
      deleteButton.props.onClick();
    });
    expect(dialog.props.open).toBeTruthy();
    const confButton = cellHandle.root.findByProps({ id: buttonIdConfirm });
    await act(async () => {
      await confButton.props.onClick();
    });
    expect(dialog.props.open).toBeFalsy();
  });

  it("only deletes after confirmation", async () => {
    const deleteButton = cellHandle.root.findByProps({ id: buttonId });

    await act(async () => {
      deleteButton.props.onClick();
      cellHandle.root.findByProps({ id: buttonIdCancel }).props.onClick();
      deleteButton.props.onClick();
    });
    expect(mockDelete).not.toHaveBeenCalled();
    const confButton = cellHandle.root.findByProps({ id: buttonIdConfirm });
    await act(async () => {
      await confButton.props.onClick();
    });
    expect(mockDelete).toHaveBeenCalled();
  });
});
