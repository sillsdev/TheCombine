import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ButtonConfirmation from "components/Dialogs/ButtonConfirmation";

const mockOnClose = jest.fn();
const mockOnConfirm = jest.fn();

const renderDialog = async (
  enableEnterKeyDown = false,
  disableEscapeKeyDown = false
): Promise<void> => {
  await act(async () => {
    render(
      <ButtonConfirmation
        open
        textId="test.text"
        titleId="test.title"
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        enableEnterKeyDown={enableEnterKeyDown}
        disableEscapeKeyDown={disableEscapeKeyDown}
      />
    );
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ButtonConfirmation keyboard interaction", () => {
  it("does not trigger confirm on Enter key by default", async () => {
    await renderDialog(false, false);
    const dialog = screen.getByRole("dialog");

    await userEvent.type(dialog, "{Enter}");

    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("triggers confirm on Enter key when enableEnterKeyDown is true", async () => {
    mockOnConfirm.mockResolvedValue(undefined);
    await renderDialog(true, false);
    const dialog = screen.getByRole("dialog");

    await userEvent.type(dialog, "{Enter}");

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it("triggers close on Escape key by default", async () => {
    await renderDialog(false, false);
    const dialog = screen.getByRole("dialog");

    await userEvent.type(dialog, "{Escape}");

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not trigger close on Escape when disableEscapeKeyDown is true", async () => {
    await renderDialog(false, true);
    const dialog = screen.getByRole("dialog");

    await userEvent.type(dialog, "{Escape}");

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("triggers confirm on button click", async () => {
    mockOnConfirm.mockResolvedValue(undefined);
    await renderDialog(false, false);
    const confirmButton = screen.getByRole("button", { name: /confirm/i });

    await userEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it("triggers close on cancel button click", async () => {
    await renderDialog(false, false);
    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
