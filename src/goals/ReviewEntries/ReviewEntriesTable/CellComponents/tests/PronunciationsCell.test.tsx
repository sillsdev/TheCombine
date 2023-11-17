import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import { defaultState as pronunciationsState } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import PronunciationsCell from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/PronunciationsCell";
import theme from "types/theme";

// Mock the audio components
jest
  .spyOn(window.HTMLMediaElement.prototype, "pause")
  .mockImplementation(() => {});
jest.mock("components/Pronunciations/Recorder");

// Mock the store interactions
jest.mock("goals/ReviewEntries/Redux/ReviewEntriesActions", () => ({
  deleteAudio: (...args: any[]) => mockDeleteAudio(...args),
  uploadAudio: (...args: any[]) => mockUploadAudio(...args),
}));
jest.mock("types/hooks", () => {
  return {
    ...jest.requireActual("types/hooks"),
    useAppDispatch: () => mockDispatch,
  };
});
const mockDeleteAudio = jest.fn();
const mockUploadAudio = jest.fn();
const mockDispatch = jest.fn();
const mockStore = configureMockStore()({ pronunciationsState });

// Mock the functions used for the component in edit mode
const mockAddNewAudio = jest.fn();
const mockDelNewAudio = jest.fn();
const mockDelOldAudio = jest.fn();
const mockAudioFunctions = {
  addNewAudio: (...args: any[]) => mockAddNewAudio(...args),
  delNewAudio: (...args: any[]) => mockDelNewAudio(...args),
  delOldAudio: (...args: any[]) => mockDelOldAudio(...args),
};

// Render the cell component with a store and theme
let testRenderer: ReactTestRenderer;
const renderPronunciationsCell = async (
  pronunciationFiles: string[],
  pronunciationsNew?: string[]
): Promise<void> => {
  await act(async () => {
    testRenderer = create(
      <ThemeProvider theme={theme}>
        <Provider store={mockStore}>
          <PronunciationsCell
            audioFunctions={pronunciationsNew ? mockAudioFunctions : undefined}
            pronunciationFiles={pronunciationFiles}
            pronunciationsNew={pronunciationsNew}
            wordId={"mock-id"}
          />
        </Provider>
      </ThemeProvider>
    );
  });
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe("PronunciationsCell", () => {
  describe("not in edit mode", () => {
    it("renders", async () => {
      const mockAudio = ["1", "2", "3"];
      await renderPronunciationsCell(mockAudio);
      const playButtons = testRenderer.root.findAllByType(AudioPlayer);
      expect(playButtons).toHaveLength(mockAudio.length);
      const recordButtons = testRenderer.root.findAllByType(AudioRecorder);
      expect(recordButtons).toHaveLength(1);
    });

    it("has player that dispatches action", async () => {
      await renderPronunciationsCell(["1"]);
      await act(async () => {
        testRenderer.root.findByType(AudioPlayer).props.deleteAudio();
      });
      expect(mockDeleteAudio).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockDelNewAudio).not.toHaveBeenCalled();
      expect(mockDelOldAudio).not.toHaveBeenCalled();
    });

    it("has recorder that dispatches action", async () => {
      await renderPronunciationsCell([]);
      await act(async () => {
        testRenderer.root.findByType(AudioRecorder).props.uploadAudio();
      });
      expect(mockUploadAudio).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockAddNewAudio).not.toHaveBeenCalled();
    });
  });

  describe("in edit mode", () => {
    it("renders", async () => {
      const mockAudioOld = ["1", "2", "3", "4"];
      const mockAudioNew = ["5", "6"];
      await renderPronunciationsCell(mockAudioOld, mockAudioNew);
      const playButtons = testRenderer.root.findAllByType(AudioPlayer);
      expect(playButtons).toHaveLength(
        mockAudioOld.length + mockAudioNew.length
      );
      const recordButtons = testRenderer.root.findAllByType(AudioRecorder);
      expect(recordButtons).toHaveLength(1);
    });

    it("has players that call prop functions", async () => {
      await renderPronunciationsCell(["old"], ["new"]);
      const playButtons = testRenderer.root.findAllByType(AudioPlayer);

      // player for audio present prior to row edit
      await act(async () => {
        playButtons[0].props.deleteAudio();
      });
      expect(mockDelOldAudio).toHaveBeenCalled();
      expect(mockDelNewAudio).not.toHaveBeenCalled();
      expect(mockDeleteAudio).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();

      jest.resetAllMocks();

      // player for audio added during row edit
      await act(async () => {
        playButtons[1].props.deleteAudio();
      });
      expect(mockDelNewAudio).toHaveBeenCalled();
      expect(mockDelOldAudio).not.toHaveBeenCalled();
      expect(mockDeleteAudio).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("has recorder that calls a prop function", async () => {
      await renderPronunciationsCell([], []);
      await act(async () => {
        testRenderer.root.findByType(AudioRecorder).props.uploadAudio();
      });
      expect(mockAddNewAudio).toHaveBeenCalled();
      expect(mockUploadAudio).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});
