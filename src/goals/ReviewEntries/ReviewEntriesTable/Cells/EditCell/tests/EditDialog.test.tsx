import { type ChangeEvent } from "react";
import { Provider } from "react-redux";
import { type ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { GramCatGroup, Status, type Word } from "api/models";
import { type CurrentProjectState } from "components/Project/ProjectReduxTypes";
import EditDialog, {
  EditDialogId,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditDialog";
import { newProject } from "types/project";
import { newSemanticDomain } from "types/semanticDomain";
import { newDefinition, newSense, newWord } from "types/word";
import { defaultWritingSystem } from "types/writingSystem";

// Container uses Portal, not supported in react-test-renderer
jest.mock("@mui/material/Dialog", () =>
  jest.requireActual("@mui/material/Container")
);
// Textfield with multiline not supported in react-test-renderer
jest.mock("@mui/material/TextField", () => "div");

jest.mock("backend", () => ({
  deleteAudio: (...args: any[]) => mockDeleteAudio(...args),
  updateWord: (word: Word) => mockUpdateWord(word),
}));
jest.mock("components/Pronunciations/AudioRecorder");
jest.mock(
  "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditSenseDialog"
);
jest.mock("types/hooks", () => ({
  ...jest.requireActual("types/hooks"),
  useAppDispatch: () => mockDispatch,
}));

const mockClose = jest.fn();
const mockConfirm = jest.fn();
const mockDeleteAudio = jest.fn();
const mockDispatch = jest.fn();
const mockUpdateWord = jest.fn();

const mockTextFieldEvent = (
  value: string
): ChangeEvent<HTMLInputElement | HTMLTextAreaElement> =>
  ({ target: { value } }) as any;
const mockWord = (): Word => ({
  ...newWord("vernacular"),
  senses: [
    {
      ...newSense("gloss 1"),
      definitions: [newDefinition("def A", "aa"), newDefinition("def B", "bb")],
    },
    {
      ...newSense("gloss 2"),
      semanticDomains: [newSemanticDomain("2.2", "two-point-two")],
    },
    { ...newSense("gloss 3"), accessibility: Status.Protected },
    {
      ...newSense("gloss 3"),
      grammaticalInfo: {
        catGroup: GramCatGroup.Verb,
        grammaticalCategory: "vt",
      },
    },
  ],
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

let renderer: ReactTestRenderer;

const renderEditDialog = async (): Promise<void> =>
  await act(async () => {
    renderer = create(
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
  it("cancel button closes if no changes", async () => {
    // Click the cancel button
    const cancelButton = renderer.root.findByProps({
      id: EditDialogId.ButtonCancel,
    });
    await act(async () => {
      cancelButton.props.onClick();
    });

    // Ensure a close without saving
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockUpdateWord).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("cancel button opens dialog if changes", async () => {
    // Make a change
    const noteTextField = renderer.root.findByProps({
      id: EditDialogId.TextFieldNote,
    });
    const newFlagText = "New note!";
    await act(async () => {
      noteTextField.props.onChange(mockTextFieldEvent(newFlagText));
    });

    // Click the cancel button and cancel the cancel
    const cancelButton = renderer.root.findByProps({
      id: EditDialogId.ButtonCancel,
    });
    await act(async () => {
      cancelButton.props.onClick();
    });
    const cancelButNoButton = renderer.root.findByProps({
      id: EditDialogId.ButtonCancelDialogCancel,
    });
    await act(async () => {
      cancelButNoButton.props.onClick();
    });

    // Ensure nothing happened
    expect(mockClose).not.toHaveBeenCalled();
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockUpdateWord).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();

    // Click the cancel button and confirm the cancel
    await act(async () => {
      cancelButton.props.onClick();
    });
    const cancelAndYesButton = renderer.root.findByProps({
      id: EditDialogId.ButtonCancelDialogConfirm,
    });
    await act(async () => {
      cancelAndYesButton.props.onClick();
    });

    // Ensure a close without saving
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockUpdateWord).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("save button closes if no changes", async () => {
    // Click the save button
    const saveButton = renderer.root.findByProps({
      id: EditDialogId.ButtonSave,
    });
    await act(async () => {
      saveButton.props.onClick();
    });

    // Ensure a close without saving
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockUpdateWord).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("save button saves changes and closes", async () => {
    // Make a change
    const flagTextField = renderer.root.findByProps({
      id: EditDialogId.TextFieldFlag,
    });
    const newFlagText = "New flag!";
    await act(async () => {
      flagTextField.props.onChange(mockTextFieldEvent(newFlagText));
    });

    // Click the save button
    const saveButton = renderer.root.findByProps({
      id: EditDialogId.ButtonSave,
    });
    await act(async () => {
      saveButton.props.onClick();
    });

    // Ensure save and close occurred, with dispatch up update goal
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockConfirm).toHaveBeenCalledTimes(1);
    expect(mockUpdateWord).toHaveBeenCalledTimes(1);
    const updatedWord: Word = mockUpdateWord.mock.calls[0][0];
    expect(updatedWord.flag.text).toEqual(newFlagText);
    expect(mockDispatch).toHaveBeenCalled();
  });
});
