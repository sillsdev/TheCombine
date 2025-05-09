import { type ChangeEvent } from "react";
import { Provider } from "react-redux";
import { type ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Project, type Sense } from "api/models";
import EditSenseDialog, {
  EditSenseDialogId,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditSenseDialog";
import { type StoreState, defaultState } from "rootRedux/types";
import { newSense } from "types/word";

// Dialog uses Portal, not supported in react-test-renderer
jest.mock("@mui/material/Dialog", () =>
  jest.requireActual("@mui/material/Container")
);
// Textfield with multiline not supported in react-test-renderer
jest.mock("@mui/material/TextField", () => "div");

jest.mock("components/TreeView", () => "div");
jest.mock("rootRedux/hooks", () => ({
  ...jest.requireActual("rootRedux/hooks"),
  useAppDispatch: () => jest.fn(),
}));

const mockClose = jest.fn();
const mockSave = jest.fn();

const mockTextFieldEvent = (
  value: string
): ChangeEvent<HTMLInputElement | HTMLTextAreaElement> =>
  ({ target: { value } }) as any;

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

let renderer: ReactTestRenderer;

const renderEditSenseDialog = async (
  definitionsEnabled = false,
  grammaticalInfoEnabled = false
): Promise<void> => {
  const mockStore = configureMockStore()(
    mockState(definitionsEnabled, grammaticalInfoEnabled)
  );
  await act(async () => {
    renderer = create(
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
      const cancelButton = renderer.root.findByProps({
        id: EditSenseDialogId.ButtonCancel,
      });
      await act(async () => {
        cancelButton.props.onClick();
      });

      // Ensure a close without saving
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockSave).not.toHaveBeenCalled();
    });

    test("cancel button opens dialog if changes", async () => {
      // Make a change
      const glossTextField = renderer.root.findByProps({
        id: `${EditSenseDialogId.TextFieldGlossPrefix}0`,
      });
      const newGlossText = "New gloss!";
      await act(async () => {
        glossTextField.props.onChange(mockTextFieldEvent(newGlossText));
      });

      // Click the cancel button and cancel the cancel
      const cancelButton = renderer.root.findByProps({
        id: EditSenseDialogId.ButtonCancel,
      });
      await act(async () => {
        cancelButton.props.onClick();
      });
      const cancelButNoButton = renderer.root.findByProps({
        id: EditSenseDialogId.ButtonCancelDialogCancel,
      });
      await act(async () => {
        cancelButNoButton.props.onClick();
      });

      // Ensure nothing happened
      expect(mockClose).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();

      // Click the cancel button and confirm the cancel
      await act(async () => {
        cancelButton.props.onClick();
      });
      const cancelAndYesButton = renderer.root.findByProps({
        id: EditSenseDialogId.ButtonCancelDialogConfirm,
      });
      await act(async () => {
        cancelAndYesButton.props.onClick();
      });

      // Ensure a close without saving
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockSave).not.toHaveBeenCalled();
    });

    test("save button closes if no changes", async () => {
      // Click the save button
      const saveButton = renderer.root.findByProps({
        id: EditSenseDialogId.ButtonSave,
      });
      await act(async () => {
        saveButton.props.onClick();
      });

      // Ensure a close without saving
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockSave).not.toHaveBeenCalled();
    });

    test("save button saves changes and closes", async () => {
      // Make a change
      const glossTextField = renderer.root.findByProps({
        id: `${EditSenseDialogId.TextFieldGlossPrefix}0`,
      });
      const newGlossText = "New gloss!";
      await act(async () => {
        glossTextField.props.onChange(mockTextFieldEvent(newGlossText));
      });

      // Click the save button
      const saveButton = renderer.root.findByProps({
        id: EditSenseDialogId.ButtonSave,
      });
      await act(async () => {
        saveButton.props.onClick();
      });

      // Ensure save and close occurred
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledTimes(1);
      const updatedSense: Sense = mockSave.mock.calls[0][0];
      expect(updatedSense.glosses[0].def).toEqual(newGlossText);
    });
  });

  describe("definitionsEnabled & grammaticalInfoEnabled", () => {
    const definitionsTitle = "reviewEntries.columns.definitions";
    const partOfSpeechTitle = "reviewEntries.columns.partOfSpeech";

    test("show definitions when definitionsEnabled is true", async () => {
      await renderEditSenseDialog(true, false);
      expect(
        renderer.root.findAllByProps({
          title: definitionsTitle,
        })
      ).toHaveLength(1);
      expect(
        renderer.root.findAllByProps({
          title: partOfSpeechTitle,
        })
      ).toHaveLength(0);
    });

    test("show part of speech when grammaticalInfoEnabled is true", async () => {
      await renderEditSenseDialog(false, true);
      expect(
        renderer.root.findAllByProps({
          title: definitionsTitle,
        })
      ).toHaveLength(0);
      expect(
        renderer.root.findAllByProps({
          title: partOfSpeechTitle,
        })
      ).toHaveLength(1);
    });
  });
});
