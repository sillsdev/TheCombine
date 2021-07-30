import React from "react";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import { defaultState } from "components/App/DefaultState";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import Pronunciations from "components/Pronunciations/PronunciationsComponent";
import RecorderIcon from "components/Pronunciations/RecorderIcon";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";

// Mock the node module used by AudioRecorder
jest.mock("components/Pronunciations/Recorder");

// Variables
var testRenderer: ReactTestRenderer;

const createMockStore = configureMockStore();
const mockStore = createMockStore(defaultState);
function mockRecordingState(wordId: string) {
  return {
    ...defaultState,
    pronunciationsState: {
      type: PronunciationsStatus.Recording,
      payload: wordId,
    },
  };
}

beforeAll(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <Pronunciations wordId="2" pronunciationFiles={["a.wav", "b.wav"]} />
      </Provider>
    );
  });
});
describe("Pronunciations", () => {
  it("renders one record button and one play button for each pronunciation file", () => {
    expect(testRenderer.root.findAllByType(AudioRecorder).length).toBe(1);
    expect(testRenderer.root.findAllByType(AudioPlayer).length).toBe(2);
  });

  // Snapshot
  it("displays buttons", () => {
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it("mouseDown and mouseUp", () => {
    const mockStartRecording = jest.fn();
    const mockStopRecording = jest.fn();
    renderer.act(() => {
      testRenderer.update(
        <Provider store={mockStore}>
          <RecorderIcon
            startRecording={mockStartRecording}
            stopRecording={mockStopRecording}
            wordId={"mockId"}
          />
        </Provider>
      );
    });
    testRenderer.root
      .findByProps({ id: "recordingButton" })
      .props.onMouseDown();
    expect(mockStartRecording).toBeCalled();
    testRenderer.root.findByProps({ id: "recordingButton" }).props.onMouseUp();
    expect(mockStopRecording).toBeCalled();
  });

  it("default style is iconRelease", () => {
    renderer.act(() => {
      testRenderer.update(
        <Provider store={mockStore}>
          <Pronunciations wordId="1" pronunciationFiles={["a.wav"]} />
        </Provider>
      );
    });
    const iconRelease = testRenderer.root
      .findByProps({ id: "icon" })
      .props.className.includes("iconRelease");
    expect(iconRelease).toBeTruthy();
  });

  it("style depends on pronunciationsAtate", () => {
    const wordId = "1";
    const mockStore2 = createMockStore(mockRecordingState(wordId));
    renderer.act(() => {
      testRenderer.update(
        <Provider store={mockStore2}>
          <Pronunciations wordId={wordId} pronunciationFiles={["a.wav"]} />
        </Provider>
      );
    });
    const iconPress = testRenderer.root
      .findByProps({ id: "icon" })
      .props.className.includes("iconPress");
    expect(iconPress).toBeTruthy();
  });
});
