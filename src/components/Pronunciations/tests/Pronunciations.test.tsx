import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import Pronunciations from "components/Pronunciations/PronunciationsComponent";
import RecorderIcon, {
  recordButtonId,
} from "components/Pronunciations/RecorderIcon";
import {
  PronunciationsState,
  defaultState as pronunciationsState,
  PronunciationsStatus,
} from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import theme from "types/theme";

// Mock the audio components
jest.mock("components/Pronunciations/Recorder");
jest
  .spyOn(window.HTMLMediaElement.prototype, "pause")
  .mockImplementation(() => {});

// Variables
let testRenderer: renderer.ReactTestRenderer;

const createMockStore = configureMockStore();
const mockStore = createMockStore({ pronunciationsState });
function mockRecordingState(wordId: string): {
  pronunciationsState: Partial<PronunciationsState>;
} {
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
              deleteAudio={jest.fn()}
              uploadAudio={jest.fn()}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
});
describe("Pronunciations", () => {
  it("renders one record button and one play button for each pronunciation file", () => {
    expect(testRenderer.root.findAllByType(AudioRecorder)).toHaveLength(1);
    expect(testRenderer.root.findAllByType(AudioPlayer)).toHaveLength(2);
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

    expect(mockStartRecording).not.toBeCalled();
    testRenderer.root.findByProps({ id: recordButtonId }).props.onMouseDown();
    expect(mockStartRecording).toBeCalled();

    expect(mockStopRecording).not.toBeCalled();
    testRenderer.root.findByProps({ id: recordButtonId }).props.onMouseUp();
    expect(mockStopRecording).toBeCalled();
  });

  it("default style is iconRelease", () => {
    renderer.act(() => {
      testRenderer.update(
        <ThemeProvider theme={theme}>
          <StyledEngineProvider>
            <Provider store={mockStore}>
              <Pronunciations
                wordId="1"
                pronunciationFiles={["a.wav"]}
                deleteAudio={jest.fn()}
                uploadAudio={jest.fn()}
              />
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
              <Pronunciations
                wordId={wordId}
                pronunciationFiles={["a.wav"]}
                deleteAudio={jest.fn()}
                uploadAudio={jest.fn()}
              />
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
