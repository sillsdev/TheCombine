import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import SaveDeferButtons from "goals/MergeDuplicates/MergeDupsStep/SaveDeferButtons";
import { resetTreeToInitial } from "goals/MergeDuplicates/Redux/MergeDupsActions";
import { defaultState as defaultMergeDupState } from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { defaultState } from "rootRedux/types";
import { testWordList } from "types/word";

jest.mock("goals/Redux/GoalActions");
jest.mock("backend");

const mockDispatch = jest.fn();
jest.mock("rootRedux/hooks", () => ({
  ...jest.requireActual("rootRedux/hooks"),
  useAppDispatch: () => mockDispatch,
}));

const mockStore = configureMockStore();

function createMockStore(hasChanges = false): any {
  const words = testWordList();
  const data = { words: { [words[0].id]: words[0] }, senses: {} };
  const tree = hasChanges
    ? {
        words: {
          [words[0].id]: { sensesGuids: {}, vern: "test", flag: {} },
        },
        sidebar: {},
        deletedSenseGuids: [],
      }
    : { words: {}, sidebar: {}, deletedSenseGuids: [] };
  const initialTree = JSON.stringify({
    words: {},
    sidebar: {},
    deletedSenseGuids: [],
  });
  const audio = {
    counts: {},
    moves: hasChanges ? { [words[0].id]: [] } : {},
  };

  const mergeDuplicateGoal = {
    ...defaultMergeDupState,
    data,
    tree,
    audio,
    initialTree,
  };

  return mockStore({
    ...defaultState,
    mergeDuplicateGoal,
  });
}

const renderSaveDeferButtons = async (hasChanges: boolean): Promise<void> => {
  render(
    <Provider store={createMockStore(hasChanges)}>
      <SaveDeferButtons />
    </Provider>
  );
};

describe("SaveDeferButtons", () => {
  it("renders all buttons", async () => {
    await renderSaveDeferButtons(false);

    expect(screen.getByText("buttons.saveAndContinue")).toBeInTheDocument();
    expect(screen.getByText("buttons.defer")).toBeInTheDocument();
    expect(screen.getByText("buttons.revertSet")).toBeInTheDocument();
  });

  it("disables revert button when no changes", async () => {
    await renderSaveDeferButtons(false);

    const revertButton = screen.getByTitle("mergeDups.helpText.revertSet");
    expect(revertButton).toBeDisabled();
  });

  it("enables revert button when changes exist", async () => {
    await renderSaveDeferButtons(true);

    const revertButton = screen.getByTitle("mergeDups.helpText.revertSet");
    expect(revertButton).not.toBeDisabled();
  });

  it("shows confirmation dialog when revert is clicked", async () => {
    await renderSaveDeferButtons(true);

    const revertButton = screen.getByTitle("mergeDups.helpText.revertSet");
    await userEvent.click(revertButton);

    expect(
      screen.getByText("mergeDups.helpText.revertSetDialog")
    ).toBeInTheDocument();
  });

  it("cancels revert when cancel button is clicked", async () => {
    await renderSaveDeferButtons(true);

    const revertButton = screen.getByTitle("mergeDups.helpText.revertSet");
    await userEvent.click(revertButton);

    // Dialog should be visible
    expect(screen.getByRole("dialog")).toBeVisible();

    const cancelButton = screen.getByTestId("revert-cancel");
    await userEvent.click(cancelButton);

    // After clicking cancel, wait for the dialog to close and be removed from DOM
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("dispatches reset action when confirm is clicked", async () => {
    await renderSaveDeferButtons(true);

    const revertButton = screen.getByTitle("mergeDups.helpText.revertSet");
    await userEvent.click(revertButton);

    const confirmButton = screen.getByTestId("revert-confirm");
    await userEvent.click(confirmButton);

    // Wait for the action to be dispatched
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(resetTreeToInitial());
    });
  });
});
