import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CancelConfirmDialog from "components/Dialogs/CancelConfirmDialog";

const mockHandleCancel = jest.fn();
const mockHandleConfirm = jest.fn();

const renderDialog = async (enableEnterKeyDown = false): Promise<void> => {
  await act(async () => {
    render(
      <CancelConfirmDialog
        open={true}
        text="Test dialog text"
        handleCancel={mockHandleCancel}
        handleConfirm={mockHandleConfirm}
        enableEnterKeyDown={enableEnterKeyDown}
      />
    );
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CancelConfirmDialog keyboard interaction", () => {
  it("does not trigger confirm on Enter key by default", async () => {
    await renderDialog(false);
    const dialog = screen.getByRole("dialog");

    await userEvent.type(dialog, "{Enter}");

    expect(mockHandleConfirm).not.toHaveBeenCalled();
  });

  it("triggers confirm on Enter key when enableEnterKeyDown is true", async () => {
    mockHandleConfirm.mockResolvedValue(undefined);
    await renderDialog(true);
    const dialog = screen.getByRole("dialog");

    await userEvent.type(dialog, "{Enter}");

    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it("triggers cancel on Escape key by default", async () => {
    await renderDialog(false);
    const dialog = screen.getByRole("dialog");

    await userEvent.type(dialog, "{Escape}");

    expect(mockHandleCancel).toHaveBeenCalledTimes(1);
  });

  it("triggers confirm on button click", async () => {
    mockHandleConfirm.mockResolvedValue(undefined);
    await renderDialog(false);
    const confirmButton = screen.getByRole("button", { name: /confirm/i });

    await userEvent.click(confirmButton);

    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it("triggers cancel on button click", async () => {
    await renderDialog(false);
    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    await userEvent.click(cancelButton);

    expect(mockHandleCancel).toHaveBeenCalledTimes(1);
  });
});
