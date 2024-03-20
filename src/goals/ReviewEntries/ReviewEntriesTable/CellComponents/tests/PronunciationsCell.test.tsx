import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Pronunciation } from "api/models";
import { defaultState as currentProjectState } from "components/Project/ProjectReduxTypes";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import { defaultState as pronunciationsState } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import PronunciationsCell from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/PronunciationsCell";
import { StoreState } from "types";
import theme from "types/theme";
import { newPronunciation } from "types/word";

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
const mockState: Partial<StoreState> = {
  currentProjectState,
  pronunciationsState,
};
const mockStore = configureMockStore()(mockState);

// Mock the functions used for the component in edit mode
const mockAddNewAudio = jest.fn();
const mockDelNewAudio = jest.fn();
const mockRepNewAudio = jest.fn();
const mockDelOldAudio = jest.fn();
const mockRepOldAudio = jest.fn();
const mockAudioFunctions = {
  addNewAudio: (...args: any[]) => mockAddNewAudio(...args),
  delNewAudio: (...args: any[]) => mockDelNewAudio(...args),
  repNewAudio: (...args: any[]) => mockRepNewAudio(...args),
  delOldAudio: (...args: any[]) => mockDelOldAudio(...args),
  repOldAudio: (...args: any[]) => mockRepOldAudio(...args),
};

// Render the cell component with a store and theme
let testRenderer: ReactTestRenderer;
const renderPronunciationsCell = async (
  audio: Pronunciation[],
  audioNew?: Pronunciation[]
): Promise<void> => {
  await act(async () => {
    testRenderer = create(
      <ThemeProvider theme={theme}>
        <Provider store={mockStore}>
          <PronunciationsCell
            audioFunctions={audioNew ? mockAudioFunctions : undefined}
            audio={audio}
            audioNew={audioNew}
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
      const mockAudio = ["1", "2", "3"].map((f) => newPronunciation(f));
      await renderPronunciationsCell(mockAudio);
      const playButtons = testRenderer.root.findAllByType(AudioPlayer);
      expect(playButtons).toHaveLength(mockAudio.length);
      const recordButtons = testRenderer.root.findAllByType(AudioRecorder);
      expect(recordButtons).toHaveLength(1);
    });

    it("has player that dispatches action", async () => {
      await renderPronunciationsCell([newPronunciation("1")]);
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
      const mockAudioOld = ["1", "2", "3", "4"].map((f) => newPronunciation(f));
      const mockAudioNew = ["5", "6"].map((f) => newPronunciation(f));
      await renderPronunciationsCell(mockAudioOld, mockAudioNew);
      const playButtons = testRenderer.root.findAllByType(AudioPlayer);
      expect(playButtons).toHaveLength(
        mockAudioOld.length + mockAudioNew.length
      );
      const recordButtons = testRenderer.root.findAllByType(AudioRecorder);
      expect(recordButtons).toHaveLength(1);
    });

    it("has players that call prop functions", async () => {
      await renderPronunciationsCell(
        [newPronunciation("old")],
        [newPronunciation("new")]
      );
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
