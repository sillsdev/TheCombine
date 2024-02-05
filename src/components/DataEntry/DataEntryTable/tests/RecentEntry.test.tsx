import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import {
  ReactTestInstance,
  ReactTestRenderer,
  act,
  create,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { Word } from "api/models";
import { defaultState } from "components/App/DefaultState";
import {
  EntryNote,
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import RecentEntry from "components/DataEntry/DataEntryTable/RecentEntry";
import { EditTextDialog } from "components/Dialogs";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import theme from "types/theme";
import { newPronunciation, simpleWord } from "types/word";
import { newWritingSystem } from "types/writingSystem";

jest.mock("@mui/material/Autocomplete", () => "div");

const mockStore = configureMockStore()(defaultState);
const mockVern = "Vernacular";
const mockGloss = "Gloss";
const mockWord = simpleWord(mockVern, mockGloss);
const mockText = "Test text";
const mockUpdateGloss = jest.fn();
const mockUpdateNote = jest.fn();
const mockUpdateVern = jest.fn();

let testMaster: ReactTestRenderer;
let testHandle: ReactTestInstance;

async function renderWithWord(word: Word): Promise<void> {
  await act(async () => {
    testMaster = create(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <RecentEntry
              entry={word}
              rowIndex={0}
              senseGuid={word.senses[0].guid}
              updateGloss={mockUpdateGloss}
              updateNote={mockUpdateNote}
              updateVern={mockUpdateVern}
              removeEntry={jest.fn()}
              addAudioToWord={jest.fn()}
              delAudioFromWord={jest.fn()}
              repAudioInWord={jest.fn()}
              focusNewEntry={jest.fn()}
              analysisLang={newWritingSystem()}
              vernacularLang={newWritingSystem()}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
  testHandle = testMaster.root;
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("ExistingEntry", () => {
  describe("component", () => {
    it("renders recorder and no players", async () => {
      await renderWithWord(mockWord);
      expect(testHandle.findAllByType(AudioPlayer).length).toEqual(0);
      expect(testHandle.findAllByType(AudioRecorder).length).toEqual(1);
    });

    it("renders recorder and 3 players", async () => {
      const audio = ["a.wav", "b.wav", "c.wav"].map((f) => newPronunciation(f));
      await renderWithWord({ ...mockWord, audio });
      expect(testHandle.findAllByType(AudioPlayer).length).toEqual(3);
      expect(testHandle.findAllByType(AudioRecorder).length).toEqual(1);
    });
  });

  describe("vernacular", () => {
    it("updates if changed", async () => {
      await renderWithWord(mockWord);
      testHandle = testHandle.findByType(VernWithSuggestions);
      async function updateVernAndBlur(text: string): Promise<void> {
        await act(async () => {
          await testHandle.props.updateVernField(text);
          await testHandle.props.onBlur();
        });
      }

      await updateVernAndBlur(mockVern);
      expect(mockUpdateVern).toHaveBeenCalledTimes(0);
      await updateVernAndBlur(mockText);
      expect(mockUpdateVern).toBeCalledWith(0, mockText);
    });
  });

  describe("gloss", () => {
    it("updates if changed", async () => {
      await renderWithWord(mockWord);
      testHandle = testHandle.findByType(GlossWithSuggestions);
      async function updateGlossAndBlur(text: string): Promise<void> {
        await act(async () => {
          await testHandle.props.updateGlossField(text);
          await testHandle.props.onBlur();
        });
      }

      await updateGlossAndBlur(mockGloss);
      expect(mockUpdateGloss).toHaveBeenCalledTimes(0);
      await updateGlossAndBlur(mockText);
      expect(mockUpdateGloss).toBeCalledWith(0, mockText);
    });
  });

  describe("note", () => {
    it("updates text", async () => {
      await renderWithWord(mockWord);
      testHandle = testHandle.findByType(EntryNote).findByType(EditTextDialog);
      await act(async () => {
        testHandle.props.updateText(mockText);
      });
      expect(mockUpdateNote).toBeCalledWith(0, mockText);
    });
  });
});
