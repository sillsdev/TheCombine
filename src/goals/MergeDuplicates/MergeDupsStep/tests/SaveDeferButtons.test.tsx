import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { OffOnSetting } from "api/models";
import SaveDeferButtons from "goals/MergeDuplicates/MergeDupsStep/SaveDeferButtons";
import { defaultState as defaultMergeDupState } from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { StoreState } from "rootRedux/types";
import { testWordList } from "types/word";

jest.mock("goals/Redux/GoalActions");
jest.mock("backend");

const mockStore = configureMockStore<StoreState>();

function setMockStore(hasChanges = false): any {
  const words = testWordList();
  const data = { words: { [words[0].id]: words[0] }, senses: {} };
  const tree = hasChanges
    ? { words: { [words[0].id]: { sensesGuids: {}, vern: "test", flag: {} } }, sidebar: {}, deletedSenseGuids: [] }
    : { words: {}, sidebar: {}, deletedSenseGuids: [] };
  const initialTree = { words: {}, sidebar: {}, deletedSenseGuids: [] };
  const audio = { counts: {}, moves: hasChanges ? { [words[0].id]: [] } : {} };

  const mergeDuplicateGoal = {
    ...defaultMergeDupState,
    data,
    tree,
    audio,
    initialState: {
      tree: initialTree,
    },
  };

  return mockStore({
    mergeDuplicateGoal,
    currentProjectState: {
      project: {
        protectedDataOverrideEnabled: OffOnSetting.Off,
      },
    },
  } as any);
}

describe("SaveDeferButtons", () => {
  it("renders all buttons", () => {
    render(
      <Provider store={setMockStore()}>
        <SaveDeferButtons />
      </Provider>
    );

    expect(screen.getByText("buttons.saveAndContinue")).toBeInTheDocument();
    expect(screen.getByText("buttons.defer")).toBeInTheDocument();
    expect(screen.getByText("buttons.revertSet")).toBeInTheDocument();
  });

  it("disables revert button when no changes", () => {
    render(
      <Provider store={setMockStore(false)}>
        <SaveDeferButtons />
      </Provider>
    );

    const revertButton = screen.getByTitle("mergeDups.helpText.revertSet");
    expect(revertButton).toBeDisabled();
  });

  it("enables revert button when changes exist", () => {
    render(
      <Provider store={setMockStore(true)}>
        <SaveDeferButtons />
      </Provider>
    );

    const revertButton = screen.getByTitle("mergeDups.helpText.revertSet");
    expect(revertButton).not.toBeDisabled();
  });

  it("shows confirmation dialog when revert is clicked", async () => {
    render(
      <Provider store={setMockStore(true)}>
        <SaveDeferButtons />
      </Provider>
    );

    const revertButton = screen.getByTitle("mergeDups.helpText.revertSet");
    await act(async () => {
      await userEvent.click(revertButton);
    });

    expect(screen.getByText("mergeDups.helpText.revertSetDialog")).toBeInTheDocument();
  });

  it("cancels revert when cancel button is clicked", async () => {
    render(
      <Provider store={setMockStore(true)}>
        <SaveDeferButtons />
      </Provider>
    );

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
    const store = setMockStore(true);
    render(
      <Provider store={store}>
        <SaveDeferButtons />
      </Provider>
    );

    const revertButton = screen.getByTitle("mergeDups.helpText.revertSet");
    await userEvent.click(revertButton);

    const confirmButton = screen.getByTestId("revert-confirm");
    await userEvent.click(confirmButton);

    // Wait for the action to be dispatched
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(
        expect.objectContaining({ type: "mergeDupStepReducer/resetTreeToInitialAction" })
      );
    });
  });
});
