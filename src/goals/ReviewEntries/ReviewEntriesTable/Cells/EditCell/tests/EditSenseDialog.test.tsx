import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { Project, type Sense } from "api/models";
import EditSenseDialog, {
  EditSenseDialogId,
  EditSenseDialogTextId,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditSenseDialog";
import { type StoreState, defaultState } from "rootRedux/types";
import { newSense } from "types/word";

const mockClose = jest.fn();
const mockSave = jest.fn();

const mockState = (
  definitionsEnabled = false,
  grammaticalInfoEnabled = false
): StoreState => {
  const project: Project = {
    ...defaultState.currentProjectState.project,
    definitionsEnabled,
    grammaticalInfoEnabled,
  };
  return {
    ...defaultState,
    currentProjectState: { ...defaultState.currentProjectState, project },
  };
};

const renderEditSenseDialog = async (
  definitionsEnabled = false,
  grammaticalInfoEnabled = false
): Promise<void> => {
  const mockStore = configureMockStore()(
    mockState(definitionsEnabled, grammaticalInfoEnabled)
  );
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <EditSenseDialog
          close={mockClose}
          isOpen
          save={mockSave}
          sense={newSense("gloss")}
        />
      </Provider>
    );
  });
};

const getGlossFields = (): HTMLElement[] => {
  const region = screen
    .getByText(EditSenseDialogTextId.CardGlosses)
    .closest('[role="region"]') as HTMLElement;
  return within(region).getAllByRole("textbox");
};

beforeEach(async () => {
  jest.clearAllMocks();
});

describe("EditSenseDialog", () => {
  describe("cancel and save buttons", () => {
    beforeEach(async () => {
      await renderEditSenseDialog();
    });

    test("cancel button closes if no changes", async () => {
      // Click the cancel button
      await userEvent.click(screen.getByTestId(EditSenseDialogId.ButtonCancel));

      // Ensure a close without saving
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockSave).not.toHaveBeenCalled();
    });

    test("cancel button opens dialog if changes", async () => {
      // Make a change
      await userEvent.type(getGlossFields()[0], "glossier");

      // Click the cancel button and cancel the cancel
      await userEvent.click(screen.getByTestId(EditSenseDialogId.ButtonCancel));
      await userEvent.click(
        screen.getByTestId(EditSenseDialogId.ButtonCancelDialogCancel)
      );

      // Ensure nothing happened
      expect(mockClose).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();

      // Click the cancel button and confirm the cancel
      await userEvent.click(screen.getByTestId(EditSenseDialogId.ButtonCancel));
      await userEvent.click(
        screen.getByTestId(EditSenseDialogId.ButtonCancelDialogConfirm)
      );

      // Ensure a close without saving
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockSave).not.toHaveBeenCalled();
    });

    test("save button closes if no changes", async () => {
      // Click the save button
      await userEvent.click(screen.getByTestId(EditSenseDialogId.ButtonSave));

      // Ensure a close without saving
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockSave).not.toHaveBeenCalled();
    });

    test("save button saves changes and closes", async () => {
      // Make a change
      const glossField = getGlossFields()[0];
      await userEvent.clear(glossField);
      const newGlossText = "New gloss!";
      await userEvent.type(glossField, newGlossText);

      // Click the save button
      await userEvent.click(screen.getByTestId(EditSenseDialogId.ButtonSave));

      // Ensure save and close occurred
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledTimes(1);
      const updatedSense: Sense = mockSave.mock.calls[0][0];
      expect(updatedSense.glosses[0].def).toEqual(newGlossText);
    });
  });

  describe("definitionsEnabled & grammaticalInfoEnabled", () => {
    const definitionsTitle = EditSenseDialogTextId.CardDefinitions;
    const partOfSpeechTitle = EditSenseDialogTextId.CardPartOfSpeech;

    test("show definitions when definitionsEnabled is true", async () => {
      await renderEditSenseDialog(true, false);
      expect(screen.queryByText(definitionsTitle)).toBeTruthy();
      expect(screen.queryByText(partOfSpeechTitle)).toBeNull();
    });

    test("show part of speech when grammaticalInfoEnabled is true", async () => {
      await renderEditSenseDialog(false, true);
      expect(screen.queryByText(definitionsTitle)).toBeNull();
      expect(screen.queryByText(partOfSpeechTitle)).toBeTruthy();
    });
  });
});
