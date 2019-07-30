import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../App/DefaultState";
import { Provider } from "react-redux";
import { Pronunciations as PronunciationsComponent } from "../PronunciationsComponent";
import Pronunciations from "../PronunciationsComponent";
import AudioPlayer from "../AudioPlayer";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import AudioRecorder from "../AudioRecorder";

const createMockStore = configureMockStore([]);

// Mock the node module used by AudioRecorder
jest.mock("mic-recorder");
jest.mock("../Recorder");

// Variables
var testRenderer: ReactTestRenderer;
var pronunciationComponent: PronunciationsComponent;

// This mock bypasses the fact that react-test-renderer does not support portals, with no clean solution. This bypasses the whole issue
// by replacing the portal-creating object (the Dialog) with a lightweight, innocuous Material-Ui component with no such glitchy properties.
jest.mock("@material-ui/core", () => {
  const materialUiCore = jest.requireActual("@material-ui/core");
  return {
    ...materialUiCore,
    Dialog: materialUiCore.Container
  };
});

const mockStore = createMockStore(defaultState);

beforeAll(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <Pronunciations wordId="2" pronunciationFiles={["a.wav", "b.wav"]} />
        />
      </Provider>
    );
  });
  pronunciationComponent = testRenderer.root.findByType(Pronunciations)
    .instance;
});

it("renders one record button and one play button for each pronunciation file", () => {
  expect(testRenderer.root.findAllByType(AudioRecorder).length).toBe(1);
  expect(testRenderer.root.findAllByType(AudioPlayer).length).toBe(2);
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
