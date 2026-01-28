import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CancelConfirmDialog, {
  CancelConfirmDialogProps,
} from "components/Dialogs/CancelConfirmDialog";

const mockHandleCancel = jest.fn();
const mockHandleConfirm = jest.fn();

const renderDialog = async (
  props?: Partial<CancelConfirmDialogProps>
): Promise<void> => {
  await act(async () => {
    render(
      <CancelConfirmDialog
        {...props}
        open
        text={props?.text || "Test dialog text"}
        handleCancel={mockHandleCancel}
        handleConfirm={mockHandleConfirm}
      />
    );
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CancelConfirmDialog keyboard interaction", () => {
  it("does not trigger confirm on Enter key by default", async () => {
    await renderDialog();

    await userEvent.keyboard("{Enter}");

    expect(mockHandleConfirm).not.toHaveBeenCalled();
  });

  it("triggers confirm on Enter key when focusOnConfirmButton is true", async () => {
    await renderDialog({ focusOnConfirmButton: true });
    const confirmButton = screen.getByRole("button", { name: /confirm/i });

    await waitFor(() => expect(confirmButton).toHaveFocus());

    await userEvent.keyboard("{Enter}");

    expect(mockHandleCancel).not.toHaveBeenCalled();
    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it("triggers cancel on Escape key by default", async () => {
    await renderDialog();

    await userEvent.keyboard("{Escape}");

    expect(mockHandleCancel).toHaveBeenCalledTimes(1);
    expect(mockHandleConfirm).not.toHaveBeenCalled();
  });

  it("does not trigger cancel on Escape key when disableEscapeKeyDown is true", async () => {
    await renderDialog({ disableEscapeKeyDown: true });

    await userEvent.keyboard("{Escape}");

    expect(mockHandleCancel).not.toHaveBeenCalled();
  });

  it("triggers confirm on button click", async () => {
    await renderDialog();
    const confirmButton = screen.getByRole("button", { name: /confirm/i });

    await userEvent.click(confirmButton);

    expect(mockHandleCancel).not.toHaveBeenCalled();
    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it("triggers cancel on button click", async () => {
    await renderDialog();
    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    await userEvent.click(cancelButton);

    expect(mockHandleCancel).toHaveBeenCalledTimes(1);
    expect(mockHandleConfirm).not.toHaveBeenCalled();
  });
});
