import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { type Word } from "api/models";
import { type CurrentProjectState } from "components/Project/ProjectReduxTypes";
import EditDialog, {
  EditDialogId,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditDialog";
import { newProject } from "types/project";
import { newSense, newWord } from "types/word";
import { defaultWritingSystem } from "types/writingSystem";

jest.mock("backend", () => ({
  deleteAudio: () => jest.fn(),
  updateWord: (word: Word) => mockUpdateWord(word),
}));
jest.mock("components/Pronunciations/AudioRecorder");
jest.mock(
  "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditSensesCardContent",
  () => ({
    __esModule: true,
    default: (props: { showSenses: boolean }) => (
      <div
        data-testid={props.showSenses ? mockSenseStackId : mockSenseSummaryId}
      />
    ),
  })
);
jest.mock("i18n", () => ({})); // else `thrown: "Error: AggregateError`
jest.mock("rootRedux/hooks", () => ({
  ...jest.requireActual("rootRedux/hooks"),
  useAppDispatch: () => mockDispatch,
}));

const mockClose = jest.fn();
const mockConfirm = jest.fn();
const mockDispatch = jest.fn();
const mockUpdateWord = jest.fn();

const mockSenseStackId = "stack-o-senses";
const mockSenseSummaryId = "summary-o-senses";

/** Returns minimalist multi-sense word. */
const mockWord = (): Word => ({
  ...newWord("vernacular"),
  senses: [newSense("gloss1"), newSense("gloss2")],
});

const currentProjectState: Partial<CurrentProjectState> = {
  project: {
    ...newProject(),
    analysisWritingSystems: [defaultWritingSystem],
    definitionsEnabled: true,
    grammaticalInfoEnabled: true,
    vernacularWritingSystem: defaultWritingSystem,
  },
};
const mockStore = configureMockStore()({ currentProjectState });

const renderEditDialog = async (): Promise<void> =>
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <EditDialog close={mockClose} confirm={mockConfirm} word={mockWord()} />
      </Provider>
    );
  });

beforeEach(async () => {
  jest.clearAllMocks();
  mockUpdateWord.mockImplementation((w: Word) =>
    Promise.resolve({ ...w, id: `${w.id}++` })
  );
  await renderEditDialog();
});

describe("EditDialog", () => {
  describe("cancel and save buttons", () => {
    test("cancel button closes if no changes", async () => {
      // Click the cancel button
      await userEvent.click(screen.getByTestId(EditDialogId.ButtonCancel));

      // Ensure a close without saving
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockConfirm).not.toHaveBeenCalled();
      expect(mockUpdateWord).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    test("cancel button opens dialog if changes", async () => {
      // Make a change
      const noteField = screen.getByTestId(EditDialogId.TextFieldNote);
      await userEvent.type(noteField, "New note!");

      // Click the cancel button and cancel the cancel
      await userEvent.click(screen.getByTestId(EditDialogId.ButtonCancel));
      await userEvent.click(
        screen.getByTestId(EditDialogId.ButtonCancelDialogCancel)
      );

      // Ensure nothing happened
      expect(mockClose).not.toHaveBeenCalled();
      expect(mockConfirm).not.toHaveBeenCalled();
      expect(mockUpdateWord).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();

      // Click the cancel button and confirm the cancel
      await userEvent.click(screen.getByTestId(EditDialogId.ButtonCancel));
      await userEvent.click(
        screen.getByTestId(EditDialogId.ButtonCancelDialogConfirm)
      );

      // Ensure a close without saving
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockConfirm).not.toHaveBeenCalled();
      expect(mockUpdateWord).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    test("save button closes if no changes", async () => {
      // Click the save button
      await userEvent.click(screen.getByTestId(EditDialogId.ButtonSave));

      // Ensure a close without saving
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockConfirm).not.toHaveBeenCalled();
      expect(mockUpdateWord).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    test("save button saves changes and closes", async () => {
      // Make a change
      const flagField = screen.getByTestId(EditDialogId.TextFieldFlag);
      const newFlagText = "New flag!";
      await userEvent.type(flagField, newFlagText);

      // Click the save button
      await userEvent.click(screen.getByTestId(EditDialogId.ButtonSave));

      // Ensure save and close occurred, with dispatch up update goal
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockConfirm).toHaveBeenCalledTimes(1);
      expect(mockUpdateWord).toHaveBeenCalledTimes(1);
      const updatedWord: Word = mockUpdateWord.mock.calls[0][0];
      expect(updatedWord.flag.text).toEqual(newFlagText);
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  test("sense-view toggle button", async () => {
    // Not summary view by default
    expect(screen.queryByTestId(mockSenseStackId)).toBeTruthy();
    expect(screen.queryByTestId(mockSenseSummaryId)).toBeNull();

    // Click to turn on summary view
    const button = screen.getByTestId(EditDialogId.ButtonSensesViewToggle);
    await userEvent.click(button);
    expect(screen.queryByTestId(mockSenseStackId)).toBeNull();
    expect(screen.queryByTestId(mockSenseSummaryId)).toBeTruthy();

    // Click again to turn off summary view
    await userEvent.click(button);
    expect(screen.queryByTestId(mockSenseStackId)).toBeTruthy();
    expect(screen.queryByTestId(mockSenseSummaryId)).toBeNull();
  });
});
