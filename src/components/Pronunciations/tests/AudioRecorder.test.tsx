import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import { recordIconId } from "components/Pronunciations/RecorderIcon";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { type StoreState } from "rootRedux/types";
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

describe("AudioRecorder", () => {
  test("default icon style is idle", async () => {
    await act(async () => {
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

  test("icon style depends on pronunciations state", async () => {
    const wordId = "1";
    const mockStore2 = configureMockStore()(mockRecordingState(wordId));
    await act(async () => {
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
