import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import {
  ReactTestInstance,
  ReactTestRenderer,
  act,
  create,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Word } from "api/models";
import NoteButton from "components/Buttons/NoteButton";
import {
  DeleteEntry,
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import RecentEntry from "components/DataEntry/DataEntryTable/RecentEntry";
import EditTextDialog from "components/Dialogs/EditTextDialog";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import { defaultState } from "rootRedux/types";
import theme from "types/theme";
import { newPronunciation, simpleWord } from "types/word";
import { newWritingSystem } from "types/writingSystem";

jest.mock("@mui/material/Autocomplete", () => "div");

jest.mock("components/Project/ProjectActions", () => ({}));

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
    it("disables buttons if changing", async () => {
      await renderWithWord(mockWord);
      const vern = testHandle.findByType(VernWithSuggestions);
      const note = testHandle.findByType(NoteButton);
      const audio = testHandle.findByType(PronunciationsBackend);
      const del = testHandle.findByType(DeleteEntry);

      expect(note.props.disabled).toBeFalsy();
      expect(audio.props.disabled).toBeFalsy();
      expect(del.props.disabled).toBeFalsy();

      async function updateVern(text: string): Promise<void> {
        await act(async () => {
          await vern.props.updateVernField(text);
        });
      }

      await updateVern(mockText);
      expect(note.props.disabled).toBeTruthy();
      expect(audio.props.disabled).toBeTruthy();
      expect(del.props.disabled).toBeTruthy();

      await updateVern(mockVern);
      expect(note.props.disabled).toBeFalsy();
      expect(audio.props.disabled).toBeFalsy();
      expect(del.props.disabled).toBeFalsy();
    });

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
      expect(mockUpdateVern).toHaveBeenCalledWith(0, mockText);
    });
  });

  describe("gloss", () => {
    it("disables buttons if changing", async () => {
      await renderWithWord(mockWord);
      const gloss = testHandle.findByType(GlossWithSuggestions);
      const note = testHandle.findByType(NoteButton);
      const audio = testHandle.findByType(PronunciationsBackend);
      const del = testHandle.findByType(DeleteEntry);

      expect(note.props.disabled).toBeFalsy();
      expect(audio.props.disabled).toBeFalsy();
      expect(del.props.disabled).toBeFalsy();

      async function updateGloss(text: string): Promise<void> {
        await act(async () => {
          await gloss.props.updateGlossField(text);
        });
      }

      await updateGloss(mockText);
      expect(note.props.disabled).toBeTruthy();
      expect(audio.props.disabled).toBeTruthy();
      expect(del.props.disabled).toBeTruthy();

      await updateGloss(mockGloss);
      expect(note.props.disabled).toBeFalsy();
      expect(audio.props.disabled).toBeFalsy();
      expect(del.props.disabled).toBeFalsy();
    });

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
      expect(mockUpdateGloss).toHaveBeenCalledWith(0, mockText);
    });
  });

  describe("note", () => {
    it("updates text", async () => {
      await renderWithWord(mockWord);
      testHandle = testHandle.findByType(NoteButton).findByType(EditTextDialog);
      await act(async () => {
        testHandle.props.updateText(mockText);
      });
      expect(mockUpdateNote).toHaveBeenCalledWith(0, mockText);
    });
  });
});
