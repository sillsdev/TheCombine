import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { simpleWord, Word } from "../../../../../types/word";
import { defaultState } from "../../../../App/DefaultState";
import AudioPlayer from "../../../../Pronunciations/AudioPlayer";
import AudioRecorder from "../../../../Pronunciations/AudioRecorder";
import Recorder from "../../../../Pronunciations/Recorder";
import RecentEntry from "../RecentEntry";

jest.mock("../../../../../backend");
jest.mock("../../../../Pronunciations/Recorder");
jest.mock("../../GlossWithSuggestions/GlossWithSuggestions");
jest.mock("../../VernWithSuggestions/VernWithSuggestions");
jest.mock("../DeleteEntry/DeleteEntry");

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);
const mockWord: Word = simpleWord("", "");

let testMaster: renderer.ReactTestRenderer;
let testHandle: renderer.ReactTestInstance;

function renderWithWord(word: Word) {
  renderer.act(() => {
    testMaster = renderer.create(
      <Provider store={mockStore}>
        <RecentEntry
          allVerns={[]}
          allWords={[]}
          entry={word}
          senseIndex={0}
          updateGloss={jest.fn()}
          updateVern={jest.fn()}
          removeEntry={jest.fn()}
          addAudioToWord={jest.fn()}
          deleteAudioFromWord={jest.fn()}
          semanticDomain={{ name: "", id: "" }}
          recorder={new Recorder()}
          focusNewEntry={jest.fn()}
          analysisLang={"en"}
        />
      </Provider>
    );
  });
  testHandle = testMaster.root;
}

describe("Tests ExistingEntry", () => {
  it("renders without crashing", () => {
    renderWithWord(mockWord);
  });

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
