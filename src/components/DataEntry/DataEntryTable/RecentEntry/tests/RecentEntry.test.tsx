import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { Word } from "api/models";
import EditTextDialog from "components/Buttons/EditTextDialog";
import {
  EntryNote,
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import RecentEntry from "components/DataEntry/DataEntryTable/RecentEntry/RecentEntry";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import Recorder from "components/Pronunciations/Recorder";
import { defaultState as pronunciationsState } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import theme from "types/theme";
import { simpleWord } from "types/word";
import { newWritingSystem } from "types/writingSystem";

jest.mock("@mui/material/Autocomplete", () => "div");

jest.mock("backend");
jest.mock("components/Pronunciations/Recorder");

jest
  .spyOn(window.HTMLMediaElement.prototype, "pause")
  .mockImplementation(() => {});

const mockStore = configureMockStore()({ pronunciationsState });
const mockVern = "Vernacular";
const mockGloss = "Gloss";
const mockWord = simpleWord(mockVern, mockGloss);
const mockText = "Test text";
const mockUpdateGloss = jest.fn();
const mockUpdateNote = jest.fn();
const mockUpdateVern = jest.fn();

let testMaster: renderer.ReactTestRenderer;
let testHandle: renderer.ReactTestInstance;

function renderWithWord(word: Word) {
  renderer.act(() => {
    testMaster = renderer.create(
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
              deleteAudioFromWord={jest.fn()}
              recorder={new Recorder()}
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
    it("renders recorder and no players", () => {
      renderWithWord(mockWord);
      expect(testHandle.findAllByType(AudioPlayer).length).toEqual(0);
      expect(testHandle.findAllByType(AudioRecorder).length).toEqual(1);
    });

    it("renders recorder and 3 players", () => {
      renderWithWord({ ...mockWord, audio: ["a.wav", "b.wav", "c.wav"] });
      expect(testHandle.findAllByType(AudioPlayer).length).toEqual(3);
      expect(testHandle.findAllByType(AudioRecorder).length).toEqual(1);
    });
  });

  describe("vernacular", () => {
    it("updates if changed", async () => {
      renderWithWord(mockWord);
      testHandle = testHandle.findByType(VernWithSuggestions);
      async function updateVernAndBlur(text: string) {
        await renderer.act(async () => {
          await testHandle.props.updateVernField(text);
          await testHandle.props.onBlur();
        });
      }

      await updateVernAndBlur(mockVern);
      expect(mockUpdateVern).toBeCalledTimes(0);
      await updateVernAndBlur(mockText);
      expect(mockUpdateVern).toBeCalledWith(mockText);
    });
  });

  describe("gloss", () => {
    it("updates if changed", async () => {
      renderWithWord(mockWord);
      testHandle = testHandle.findByType(GlossWithSuggestions);
      async function updateGlossAndBlur(text: string) {
        await renderer.act(async () => {
          await testHandle.props.updateGlossField(text);
          await testHandle.props.onBlur();
        });
      }

      await updateGlossAndBlur(mockGloss);
      expect(mockUpdateGloss).toBeCalledTimes(0);
      await updateGlossAndBlur(mockText);
      expect(mockUpdateGloss).toBeCalledWith(mockText);
    });
  });

  describe("note", () => {
    it("updates text", () => {
      renderWithWord(mockWord);
      testHandle = testHandle.findByType(EntryNote).findByType(EditTextDialog);
      renderer.act(() => {
        testHandle.props.updateText(mockText);
      });
      expect(mockUpdateNote).toBeCalledWith(mockText);
    });
  });
});
