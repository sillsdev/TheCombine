import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import SaveDeferButtons from "goals/MergeDuplicates/MergeDupsStep/SaveDeferButtons";
import { newMergeTreeWord } from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { resetTreeToInitial } from "goals/MergeDuplicates/Redux/MergeDupsActions";
import { MergeTreeState } from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { defaultState } from "rootRedux/types";
import { testWordList } from "types/word";

jest.mock("backend");
jest.mock("goals/Redux/GoalActions");
jest.mock("rootRedux/hooks", () => ({
  ...jest.requireActual("rootRedux/hooks"),
  useAppDispatch: () => mockDispatch,
}));

const mockDispatch = jest.fn();
const mockStore = configureMockStore();

function createMockStore(hasChanges = false): any {
  const words = testWordList();

  const { audio, data, tree } = defaultState.mergeDuplicateGoal;

  const mergeDuplicateGoal: MergeTreeState = {
    ...defaultState.mergeDuplicateGoal,
    audio: hasChanges ? { ...audio, moves: { [words[0].id]: [] } } : audio,
    data: { ...data, words: { [words[0].id]: words[0] } },
    initialTree: JSON.stringify(tree),
    tree: hasChanges
      ? { ...tree, words: { [words[0].id]: newMergeTreeWord("test") } }
      : tree,
  };

  return mockStore({ ...defaultState, mergeDuplicateGoal });
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

    expect(screen.getByText("buttons.revertSet")).toBeDisabled();
  });

  it("enables revert button when changes exist", async () => {
    await renderSaveDeferButtons(true);

    expect(screen.getByText("buttons.revertSet")).toBeEnabled();
  });

  it("shows confirmation dialog when revert is clicked", async () => {
    await renderSaveDeferButtons(true);
    await userEvent.click(screen.getByText("buttons.revertSet"));

    expect(
      screen.getByText("mergeDups.helpText.revertSetDialog")
    ).toBeInTheDocument();
  });

  it("cancels revert when cancel button is clicked", async () => {
    await renderSaveDeferButtons(true);
    await userEvent.click(screen.getByText("buttons.revertSet"));

    // Dialog should be visible
    expect(screen.getByRole("dialog")).toBeVisible();

    await userEvent.click(screen.getByText("buttons.cancel"));

    // After clicking cancel, wait for the dialog to close and be removed from DOM
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("dispatches reset action when confirm is clicked", async () => {
    await renderSaveDeferButtons(true);
    await userEvent.click(screen.getByText("buttons.revertSet"));
    await userEvent.click(screen.getByText("buttons.confirm"));

    expect(mockDispatch).toHaveBeenCalledWith(resetTreeToInitial());
  });
});
