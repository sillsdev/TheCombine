import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import {
  ReactTestInstance,
  ReactTestRenderer,
  act,
  create,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import RecorderIcon, {
  recordButtonId,
} from "components/Pronunciations/RecorderIcon";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { type StoreState, defaultState } from "rootRedux/types";
import theme from "types/theme";

let testRenderer: ReactTestRenderer;
let testButton: ReactTestInstance;

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
    testRenderer = create(
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
  testButton = testRenderer.root.findByProps({ id: recordButtonId });
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe("RecorderIcon", () => {
  test("pointerDown records if no recording active", async () => {
    await renderRecorderIcon();
    expect(mockStartRecording).not.toHaveBeenCalled();
    await act(async () => {
      testButton.props.onPointerDown();
    });
    expect(mockStartRecording).toHaveBeenCalled();
  });

  test("pointerUp stops recording", async () => {
    await renderRecorderIcon(mockWordId);
    expect(mockStopRecording).not.toHaveBeenCalled();
    await act(async () => {
      testButton.props.onPointerUp();
    });
    expect(mockStopRecording).toHaveBeenCalled();
  });

  test("pointerUp does nothing if no recording active", async () => {
    await renderRecorderIcon();
    await act(async () => {
      testButton.props.onPointerUp();
    });
    expect(mockStopRecording).not.toHaveBeenCalled();
  });

  test("pointerUp does nothing if different word id", async () => {
    await renderRecorderIcon("different-id");
    await act(async () => {
      testButton.props.onPointerUp();
    });
    expect(mockStopRecording).not.toHaveBeenCalled();
  });
});
