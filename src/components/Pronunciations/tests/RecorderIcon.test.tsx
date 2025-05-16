import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import RecorderIcon, {
  recordButtonId,
} from "components/Pronunciations/RecorderIcon";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { type StoreState, defaultState } from "rootRedux/types";
import theme from "types/theme";

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

const mockWordId = "1234567890";

const mockStartRecording = jest.fn(() => Promise.resolve(true));
const mockStopRecording = jest.fn();

const renderRecorderIcon = async (wordId = ""): Promise<void> => {
  await act(async () => {
    render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider
            store={configureMockStore()(
              wordId ? mockRecordingState(wordId) : defaultState
            )}
          >
            <RecorderIcon
              id={mockWordId}
              startRecording={mockStartRecording}
              stopRecording={mockStopRecording}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe("RecorderIcon", () => {
  test("pointerDown records if no recording active", async () => {
    await renderRecorderIcon();
    expect(mockStartRecording).not.toHaveBeenCalled();
    fireEvent.pointerDown(screen.getByTestId(recordButtonId));
    expect(mockStartRecording).toHaveBeenCalled();
  });

  test("pointerUp stops recording", async () => {
    await renderRecorderIcon(mockWordId);
    expect(mockStopRecording).not.toHaveBeenCalled();
    fireEvent.pointerUp(screen.getByTestId(recordButtonId));
    expect(mockStopRecording).toHaveBeenCalled();
  });

  test("pointerUp does nothing if no recording active", async () => {
    await renderRecorderIcon();
    fireEvent.pointerUp(screen.getByTestId(recordButtonId));
    expect(mockStopRecording).not.toHaveBeenCalled();
  });

  test("pointerUp does nothing if different word id", async () => {
    await renderRecorderIcon("different-id");
    fireEvent.pointerUp(screen.getByTestId(recordButtonId));
    expect(mockStopRecording).not.toHaveBeenCalled();
  });
});
