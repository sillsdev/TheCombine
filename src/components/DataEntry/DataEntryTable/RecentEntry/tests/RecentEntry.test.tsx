import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { simpleWord, Word } from "types/word";
import { defaultState } from "components/App/DefaultState";
import EditTextDialog from "components/Buttons/EditTextDialog";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import Recorder from "components/Pronunciations/Recorder";
import {
  EntryNote,
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import RecentEntry from "components/DataEntry/DataEntryTable/RecentEntry/RecentEntry";

jest.mock("backend");
jest.mock("components/Pronunciations/Recorder");

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);
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
      <Provider store={mockStore}>
        <RecentEntry
          entry={word}
          senseIndex={0}
          updateGloss={mockUpdateGloss}
          updateNote={mockUpdateNote}
          updateVern={mockUpdateVern}
          removeEntry={jest.fn()}
          addAudioToWord={jest.fn()}
          deleteAudioFromWord={jest.fn()}
          recorder={new Recorder()}
          focusNewEntry={jest.fn()}
          analysisLang={"en"}
        />
      </Provider>
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
    it("updates if changed", () => {
      renderWithWord(mockWord);
      testHandle = testHandle.findByType(VernWithSuggestions);
      testHandle.props.updateVernField(mockVern);
      testHandle.props.onBlur();
      expect(mockUpdateVern).toBeCalledTimes(0);
      testHandle.props.updateVernField(mockText);
      testHandle.props.onBlur();
      expect(mockUpdateVern).toBeCalledWith(mockText);
    });
  });

  describe("gloss", () => {
    it("updates if changed", () => {
      renderWithWord(mockWord);
      testHandle = testHandle.findByType(GlossWithSuggestions);
      testHandle.props.updateGlossField(mockGloss);
      testHandle.props.onBlur();
      expect(mockUpdateGloss).toBeCalledTimes(0);
      testHandle.props.updateGlossField(mockText);
      testHandle.props.onBlur();
      expect(mockUpdateGloss).toBeCalledWith(mockText);
    });
  });

  describe("note", () => {
    it("updates text", () => {
      renderWithWord(mockWord);
      testHandle = testHandle.findByType(EntryNote).findByType(EditTextDialog);
      testHandle.props.updateText(mockText);
      expect(mockUpdateNote).toBeCalledWith(mockText);
    });
  });
});
