import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../App/DefaultState";
import { defaultState as defaultStateRE } from "../../../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesReducer";
import { Provider } from "react-redux";
import Pronunciations from "../PronunciationsComponent";
import AudioPlayer from "../AudioPlayer";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import AudioRecorder from "../AudioRecorder";
import { mockWord } from "../../../components/DataEntry/tests/MockWord";
import RecorderIconHolder from "../RecorderIconHolder";

const createMockStore = configureMockStore([]);

// Mock the node module used by AudioRecorder
jest.mock("../Recorder");

// Variables
var testRenderer: ReactTestRenderer;

const mockStore = createMockStore({
  ...defaultState,
  reviewEntriesState: {
    ...defaultStateRE,
    wordBeingRecorded: "1",
  },
});

beforeAll(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <Pronunciations wordId="2" pronunciationFiles={["a.wav", "b.wav"]} />
      </Provider>
    );
  });
});
describe("pronunciation tests", () => {
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
          <RecorderIconHolder
            startRecording={mockStartRecording}
            stopRecording={mockStopRecording}
            wordId={mockWord.id}
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

  it("style depends on isRecording state", () => {
    const mockStore2 = createMockStore({
      ...defaultState,
      reviewEntriesState: {
        ...defaultStateRE,
        wordBeingRecorded: "1",
        isRecording: true,
      },
    });
    renderer.act(() => {
      testRenderer.update(
        <Provider store={mockStore2}>
          <Pronunciations wordId="1" pronunciationFiles={["a.wav"]} />
        </Provider>
      );
    });
    const iconPress = testRenderer.root
      .findByProps({ id: "icon" })
      .props.className.includes("iconPress");
    expect(iconPress).toBeTruthy();
  });

  it("renders without crashing", () => {
    const mockStore = createMockStore(defaultState);
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>
        <Pronunciations wordId="1" pronunciationFiles={[]} />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
    testRenderer.unmount();
  });
});
