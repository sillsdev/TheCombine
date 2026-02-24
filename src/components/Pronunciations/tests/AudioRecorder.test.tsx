import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import AudioRecorder from "components/Pronunciations/AudioRecorder";
import MockThisContext from "components/Pronunciations/RecorderContext";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { type StoreState, defaultState } from "rootRedux/types";
import theme, { themeColors } from "types/theme";

jest.mock("react", () => {
  const actualReact = jest.requireActual("react");
  return {
    ...actualReact,
    useContext: (context: unknown) =>
      context === MockThisContext
        ? {
            getRecordingId: () => undefined,
            startRecording: jest.fn(() => true),
            stopRecording: jest.fn(),
          }
        : actualReact.useContext(context),
  };
});

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
const testIdRecordIcon = "FiberManualRecordIcon"; // MUI Icon data-testid

describe("AudioRecorder", () => {
  test("default icon style is idle", async () => {
    await act(async () => {
      render(
        <ThemeProvider theme={theme}>
          <StyledEngineProvider>
            <Provider store={mockStore}>
              <AudioRecorder id="1" uploadAudio={jest.fn()} />
            </Provider>
          </StyledEngineProvider>
        </ThemeProvider>
      );
    });
    const icon = screen.getByTestId(testIdRecordIcon);
    expect(icon).toHaveStyle({ color: themeColors.recordIdle });
  });

  test("icon style depends on pronunciations state", async () => {
    const wordId = "1";
    const mockStore2 = configureMockStore()(mockRecordingState(wordId));
    await act(async () => {
      render(
        <ThemeProvider theme={theme}>
          <StyledEngineProvider>
            <Provider store={mockStore2}>
              <AudioRecorder id={wordId} uploadAudio={jest.fn()} />
            </Provider>
          </StyledEngineProvider>
        </ThemeProvider>
      );
    });
    const icon = screen.getByTestId(testIdRecordIcon);
    expect(icon).toHaveStyle({ color: themeColors.recordActive });
  });
});
