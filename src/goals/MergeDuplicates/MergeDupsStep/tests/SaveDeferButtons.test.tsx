import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
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
  const data = hasChanges
    ? { words: { [words[0].id]: words[0] }, senses: {} }
    : { words: {}, senses: {} };
  const initialData = { words: {}, senses: {} };
  const tree = hasChanges
    ? { words: { [words[0].id]: { sensesGuids: {}, vern: "test" } }, sidebar: {}, deletedSenseGuids: [] }
    : { words: {}, sidebar: {}, deletedSenseGuids: [] };
  const initialTree = { words: {}, sidebar: {}, deletedSenseGuids: [] };
  const audio = { counts: {}, moves: {} };

  const mergeDuplicateGoal = {
    ...defaultMergeDupState,
    data,
    tree,
    audio,
    initialState: {
      data: initialData,
      tree: initialTree,
      audio,
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
    await act(async () => {
      await userEvent.click(revertButton);
    });

    const cancelButton = screen.getByText("buttons.cancel");
    await act(async () => {
      await userEvent.click(cancelButton);
    });

    expect(screen.queryByText("mergeDups.helpText.revertSetDialog")).not.toBeInTheDocument();
  });

  it("dispatches reset action when confirm is clicked", async () => {
    const store = setMockStore(true);
    render(
      <Provider store={store}>
        <SaveDeferButtons />
      </Provider>
    );

    const revertButton = screen.getByTitle("mergeDups.helpText.revertSet");
    await act(async () => {
      await userEvent.click(revertButton);
    });

    const confirmButton = screen.getByText("buttons.confirm");
    await act(async () => {
      await userEvent.click(confirmButton);
    });

    const actions = store.getActions();
    expect(actions).toContainEqual(
      expect.objectContaining({ type: "mergeDupStepReducer/resetTreeToInitialAction" })
    );
  });
});
