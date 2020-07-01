import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../App/DefaultState";
import { Provider } from "react-redux";
import Pronunciations from "../PronunciationsComponent";
import AudioPlayer from "../AudioPlayer";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import AudioRecorder from "../AudioRecorder";

const createMockStore = configureMockStore([]);

// Mock the node module used by AudioRecorder
jest.mock("../Recorder");

// Variables
var testRenderer: ReactTestRenderer;

const mockStore = createMockStore(defaultState);

beforeAll(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <Pronunciations wordId="2" pronunciationFiles={["a.wav", "b.wav"]} />
      </Provider>
    );
  });
});

it("renders one record button and one play button for each pronunciation file", () => {
  expect(testRenderer.root.findAllByType(AudioRecorder).length).toBe(1);
  expect(testRenderer.root.findAllByType(AudioPlayer).length).toBe(2);
});

// Snapshot
it("displays buttons", () => {
  expect(testRenderer.toJSON()).toMatchSnapshot();
});

// Snapshot
it("removes play audio button", () => {
  renderer.act(() => {
    testRenderer.update(
      <Provider store={mockStore}>
        <Pronunciations wordId="2" pronunciationFiles={["a.wav"]} />
      </Provider>
    );
  });
  expect(testRenderer.toJSON()).toMatchSnapshot();
});

// Snapshot
it("adds play audio button", () => {
  renderer.act(() => {
    testRenderer.update(
      <Provider store={mockStore}>
        <Pronunciations wordId="2" pronunciationFiles={["a.wav", "c.wav"]} />
      </Provider>
    );
  });
  expect(testRenderer.toJSON()).toMatchSnapshot();
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
});
