import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DeleteButtonWithDialog from "components/Buttons/DeleteButtonWithDialog";

const buttonId = "button-id";
const buttonIdCancel = "button-id-cancel";
const buttonIdConfirm = "button-id-confirm";
const mockDelete = jest.fn();
const textId = "text-id";

const renderDeleteCell = async (): Promise<void> => {
  await act(async () => {
    render(
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
    // Renders with dialog closed.
    expect(screen.queryByRole("dialog")).toBeNull();

    // Delete button opens the dialog.
    await userEvent.click(screen.getByTestId(buttonId));
    expect(screen.queryByRole("dialog")).toBeTruthy();

    // Cancel button closes the dialog.
    await userEvent.click(screen.getByTestId(buttonIdCancel));
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog")); // else it's just hidden
    expect(screen.queryByRole("dialog")).toBeNull();

    // Delete button opens the dialog.
    await userEvent.click(screen.getByTestId(buttonId));
    expect(screen.queryByRole("dialog")).toBeTruthy();

    // Confirm button closes the dialog.
    await userEvent.click(screen.getByTestId(buttonIdConfirm));
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog")); // else it's just hidden
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("only deletes after confirmation", async () => {
    // Delete function not called by clicking delete and cancel.
    await userEvent.click(screen.getByTestId(buttonId));
    await userEvent.click(screen.getByTestId(buttonIdCancel));
    await userEvent.click(screen.getByTestId(buttonId));
    expect(mockDelete).not.toHaveBeenCalled();

    // Delete function called upon clicking confirm.
    await userEvent.click(screen.getByTestId(buttonIdConfirm));
    expect(mockDelete).toHaveBeenCalled();
  });
});
