import { Provider } from "react-redux";
import { type ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { type Word } from "api/models";
import { type CurrentProjectState } from "components/Project/ProjectReduxTypes";
import EditDialog, {
  EditDialogId,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditDialog";
import { newProject } from "types/project";
import { newSense, newWord } from "types/word";
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
jest.mock("goals/ReviewEntries/ReviewEntriesTable/Cells/EditSensesCardContent");
jest.mock("types/hooks", () => ({
  ...jest.requireActual("types/hooks"),
  useAppDispatch: () => jest.fn(),
}));

const mockCancel = jest.fn();
const mockConfirm = jest.fn();
const mockDeleteAudio = jest.fn();
const mockUpdateWord = jest.fn();
const mockWord = (): Word => ({
  ...newWord("vernacular"),
  senses: [newSense("gloss")],
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
        <EditDialog
          cancel={mockCancel}
          confirm={mockConfirm}
          word={mockWord()}
        />
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
  it("cancel closes if no changes", async () => {
    const cancelButton = renderer.root.findByProps({
      id: EditDialogId.ButtonCancel,
    });
    await act(async () => {
      cancelButton.props.onClick();
    });
    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockUpdateWord).not.toHaveBeenCalled();
  });

  it("save closes if no changes", async () => {
    const saveButton = renderer.root.findByProps({
      id: EditDialogId.ButtonSave,
    });
    await act(async () => {
      saveButton.props.onClick();
    });
    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockUpdateWord).not.toHaveBeenCalled();
  });
});
