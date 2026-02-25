import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { toast } from "react-toastify";
import configureMockStore from "redux-mock-store";

import AudioRecorder from "components/Pronunciations/AudioRecorder";
import MockThisContext from "components/Pronunciations/RecorderContext";
import { recordButtonId } from "components/Pronunciations/RecorderIcon";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { type StoreState, defaultState } from "rootRedux/types";
import theme, { themeColors } from "types/theme";

jest.mock("react-toastify", () => ({
  toast: { error: jest.fn(), success: jest.fn(), warning: jest.fn() },
}));

const mockRecorder = {
  getRecordingId: jest.fn(),
  startRecording: jest.fn(),
  stopRecording: jest.fn(),
};

jest.mock("react", () => {
  const actualReact = jest.requireActual("react");
  return {
    ...actualReact,
    useContext: (context: unknown) =>
      context === MockThisContext
        ? mockRecorder
        : actualReact.useContext(context),
  };
});

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

async function renderRecorder(isRecordingInState = false): Promise<void> {
  const id = "1";
  const state = isRecordingInState ? mockRecordingState(id) : defaultState;

  await act(async () => {
    render(
      <ThemeProvider theme={theme}>
        <StyledEngineProvider>
          <Provider store={configureMockStore()(state)}>
            <AudioRecorder id={id} uploadAudio={jest.fn()} />
          </Provider>
        </StyledEngineProvider>
      </ThemeProvider>
    );
  });
}

beforeEach(() => {
  mockRecorder.getRecordingId.mockReturnValue(undefined);
  mockRecorder.startRecording.mockReturnValue(true);
  mockRecorder.stopRecording.mockResolvedValue(undefined);
});

describe("AudioRecorder", () => {
  describe("icon style", () => {
    it("is idle by default", async () => {
      await renderRecorder();
      const icon = screen.getByTestId(testIdRecordIcon);
      expect(icon).toHaveStyle({ color: themeColors.recordIdle });
    });

    it("depends on pronunciations state", async () => {
      await renderRecorder(true);
      const icon = screen.getByTestId(testIdRecordIcon);
      expect(icon).toHaveStyle({ color: themeColors.recordActive });
    });
  });

  describe("start recording", () => {
    async function waitForRecordButton(): Promise<HTMLElement> {
      const recordButton = screen.getByTestId(recordButtonId);
      await waitFor(() => {
        expect(recordButton).not.toBeDisabled();
      });
      return recordButton;
    }

    it("prevents start when already clicked once", async () => {
      await renderRecorder();

      const recordButton = await waitForRecordButton();
      await userEvent.click(recordButton);
      await userEvent.click(recordButton);

      expect(mockRecorder.startRecording).toHaveBeenCalledTimes(1);
    });

    it("prevents start when context has another word recording", async () => {
      mockRecorder.getRecordingId.mockReturnValue("different-word-id");
      await renderRecorder();

      const recordButton = await waitForRecordButton();
      await userEvent.click(recordButton);

      expect(mockRecorder.startRecording).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("shows recording error and unlocks retry when start fails", async () => {
      mockRecorder.startRecording.mockReturnValue(false);
      await renderRecorder();

      const recordButton = await waitForRecordButton();
      await userEvent.click(recordButton);

      expect(mockRecorder.startRecording).toHaveBeenCalledTimes(1);

      await userEvent.click(recordButton);

      expect(mockRecorder.startRecording).toHaveBeenCalledTimes(2);
      expect(toast.error).toHaveBeenCalledWith("pronunciations.recordingError");
    });
  });
});
