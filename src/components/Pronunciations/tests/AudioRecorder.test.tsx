import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { toast } from "react-toastify"; // mocked in setupTests.js
import configureMockStore from "redux-mock-store";

import AudioRecorder from "components/Pronunciations/AudioRecorder";
import Recorder from "components/Pronunciations/Recorder"; // mocked in setupTests.js
import RecorderContext from "components/Pronunciations/RecorderContext";
import { recordButtonId } from "components/Pronunciations/RecorderIcon";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { type StoreState, defaultState } from "rootRedux/types";
import theme, { themeColors } from "types/theme";

const testIdRecordIcon = "FiberManualRecordIcon"; // MUI Icon data-testid

let mockedRecorder: jest.Mocked<Recorder>;

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

/** Render the `AudioRecorder` component in the necessary providers.
 * Config options:
 * - `id`: the word id prop for the `AudioRecorder` (default: "test-word-id")
 * - `recId`: if truthy, the word id in the mock recording state;
 *   if falsy, use default pronunciations state */
async function renderRecorder(config?: {
  id?: string;
  recId?: string;
}): Promise<void> {
  const state = config?.recId ? mockRecordingState(config.recId) : defaultState;

  await act(async () => {
    render(
      <ThemeProvider theme={theme}>
        <StyledEngineProvider>
          <Provider store={configureMockStore()(state)}>
            <RecorderContext.Provider value={mockedRecorder}>
              <AudioRecorder
                id={config?.id ?? "test-word-id"}
                uploadAudio={jest.fn()}
              />
            </RecorderContext.Provider>
          </Provider>
        </StyledEngineProvider>
      </ThemeProvider>
    );
  });
}

beforeEach(() => {
  mockedRecorder = new Recorder() as jest.Mocked<Recorder>;
});

describe("AudioRecorder", () => {
  describe("icon style", () => {
    it("is idle by default", async () => {
      await renderRecorder();
      const icon = screen.getByTestId(testIdRecordIcon);
      expect(icon).toHaveStyle({ color: themeColors.recordIdle });
    });

    it("is active when recording", async () => {
      await renderRecorder({ id: "test-word-id", recId: "test-word-id" });
      const icon = screen.getByTestId(testIdRecordIcon);
      expect(icon).toHaveStyle({ color: themeColors.recordActive });
    });

    it("is grey when different word is recording", async () => {
      await renderRecorder({ id: "test-word-id", recId: "different-word-id" });
      const icon = screen.getByTestId(testIdRecordIcon);
      expect(icon).toHaveStyle({ color: theme.palette.grey[400] });
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

      expect(mockedRecorder.startRecording).toHaveBeenCalledTimes(1);
    });

    it("prevents start when context has another word recording", async () => {
      mockedRecorder.getRecordingId.mockReturnValue("different-word-id");
      await renderRecorder();

      const recordButton = await waitForRecordButton();
      await userEvent.click(recordButton);

      expect(mockedRecorder.startRecording).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("shows recording error and unlocks retry when start fails", async () => {
      mockedRecorder.startRecording.mockReturnValue(false);
      await renderRecorder();

      const recordButton = await waitForRecordButton();
      await userEvent.click(recordButton);

      expect(mockedRecorder.startRecording).toHaveBeenCalledTimes(1);

      await userEvent.click(recordButton);

      expect(mockedRecorder.startRecording).toHaveBeenCalledTimes(2);
      expect(toast.error).toHaveBeenCalledWith("pronunciations.recordingError");
    });
  });
});
