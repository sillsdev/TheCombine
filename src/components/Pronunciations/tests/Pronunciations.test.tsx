import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/mockReactI18next";

import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import Pronunciations from "components/Pronunciations/PronunciationsComponent";
import RecorderIcon from "components/Pronunciations/RecorderIcon";
import {
  defaultState as pronunciationsState,
  PronunciationsStatus,
} from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import theme from "types/theme";

// Mock the node module used by AudioRecorder
jest.mock("components/Pronunciations/Recorder");

// Variables
var testRenderer: renderer.ReactTestRenderer;

const createMockStore = configureMockStore();
const mockStore = createMockStore({ pronunciationsState });
function mockRecordingState(wordId: string) {
  return {
    pronunciationsState: {
      type: PronunciationsStatus.Recording,
      payload: wordId,
    },
  };
}

beforeAll(() => {
  renderer.act(() => {
    testRenderer = renderer.create(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <Pronunciations
              wordId="2"
              pronunciationFiles={["a.wav", "b.wav"]}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
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
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Provider store={mockStore}>
              <RecorderIcon
                startRecording={mockStartRecording}
                stopRecording={mockStopRecording}
                wordId={"mockId"}
              />
            </Provider>
          </ThemeProvider>
        </StyledEngineProvider>
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
        <ThemeProvider theme={theme}>
          <StyledEngineProvider>
            <Provider store={mockStore}>
              <Pronunciations wordId="1" pronunciationFiles={["a.wav"]} />
            </Provider>
          </StyledEngineProvider>
        </ThemeProvider>
      );
    });
    const iconRelease = testRenderer.root
      .findByProps({ id: "icon" })
      .props.className.includes("iconRelease");
    expect(iconRelease).toBeTruthy();
  });

  it("style depends on pronunciations state", () => {
    const wordId = "1";
    const mockStore2 = createMockStore(mockRecordingState(wordId));
    renderer.act(() => {
      testRenderer.update(
        <ThemeProvider theme={theme}>
          <StyledEngineProvider>
            <Provider store={mockStore2}>
              <Pronunciations wordId={wordId} pronunciationFiles={["a.wav"]} />
            </Provider>
          </StyledEngineProvider>
        </ThemeProvider>
      );
    });
    const iconPress = testRenderer.root
      .findByProps({ id: "icon" })
      .props.className.includes("iconPress");
    expect(iconPress).toBeTruthy();
  });
});
