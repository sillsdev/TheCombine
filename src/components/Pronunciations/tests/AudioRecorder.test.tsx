import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import RecorderIcon, {
  recordButtonId,
  recordIconId,
} from "components/Pronunciations/RecorderIcon";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { type StoreState } from "rootRedux/rootReduxTypes";
import theme, { themeColors } from "types/theme";

let testRenderer: ReactTestRenderer;

const mockStore = configureMockStore()(defaultState);
function mockRecordingState(wordId: string): Partial<StoreState> {
  return {
    ...defaultState,
    pronunciationsState: {
      fileName: "",
      status: PronunciationsStatus.Recording,
      wordId,
    },
  };
}

beforeAll(() => {
  act(() => {
    testRenderer = create(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <AudioRecorder id="2" uploadAudio={jest.fn()} />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
});

describe("Pronunciations", () => {
  test("pointerDown and pointerUp", () => {
    const mockStartRecording = jest.fn();
    const mockStopRecording = jest.fn();
    act(() => {
      testRenderer = create(
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Provider store={mockStore}>
              <RecorderIcon
                id={"mockId"}
                startRecording={mockStartRecording}
                stopRecording={mockStopRecording}
              />
            </Provider>
          </ThemeProvider>
        </StyledEngineProvider>
      );
    });

    expect(mockStartRecording).not.toHaveBeenCalled();
    testRenderer.root.findByProps({ id: recordButtonId }).props.onPointerDown();
    expect(mockStartRecording).toHaveBeenCalled();

    expect(mockStopRecording).not.toHaveBeenCalled();
    testRenderer.root.findByProps({ id: recordButtonId }).props.onPointerUp();
    expect(mockStopRecording).toHaveBeenCalled();
  });

  test("default style is idle", () => {
    act(() => {
      testRenderer = create(
        <ThemeProvider theme={theme}>
          <StyledEngineProvider>
            <Provider store={mockStore}>
              <AudioRecorder id="1" uploadAudio={jest.fn()} />
            </Provider>
          </StyledEngineProvider>
        </ThemeProvider>
      );
    });
    const icon = testRenderer.root.findByProps({ id: recordIconId });
    expect(icon.props.sx.color({})).toEqual(themeColors.recordIdle);
  });

  test("style depends on pronunciations state", () => {
    const wordId = "1";
    const mockStore2 = configureMockStore()(mockRecordingState(wordId));
    act(() => {
      testRenderer = create(
        <ThemeProvider theme={theme}>
          <StyledEngineProvider>
            <Provider store={mockStore2}>
              <AudioRecorder id={wordId} uploadAudio={jest.fn()} />
            </Provider>
          </StyledEngineProvider>
        </ThemeProvider>
      );
    });
    const icon = testRenderer.root.findByProps({ id: recordIconId });
    expect(icon.props.sx.color({})).toEqual(themeColors.recordActive);
  });
});
