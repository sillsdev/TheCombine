import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/mockReactI18next";

import RecorderIcon, {
  recordingButtonId,
  recordingIconId,
} from "components/Pronunciations/RecorderIcon";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import theme from "types/theme";

let testRenderer: renderer.ReactTestRenderer;
const wordId = "wordId";

const mockStartRecording = jest.fn();
const mockStopRecording = jest.fn();

const renderRecorderIcon = (
  status = PronunciationsStatus.Default,
  stateWordId?: string
): void => {
  const mockState = {
    pronunciationsState: { type: status, payload: stateWordId },
  };
  const mockStore = configureMockStore()(mockState);
  renderer.act(() => {
    testRenderer = renderer.create(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <RecorderIcon
              startRecording={mockStartRecording}
              stopRecording={mockStopRecording}
              wordId={wordId}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
};

describe("RecorderIcon", () => {
  it("default style is iconRelease", () => {
    renderRecorderIcon();
    const iconRelease = testRenderer.root
      .findByProps({ id: recordingIconId })
      .props.className.includes("iconRelease");
    expect(iconRelease).toBeTruthy();
  });

  it("style depends on pronunciations state", () => {
    renderRecorderIcon(PronunciationsStatus.Recording, wordId);
    const iconPress = testRenderer.root
      .findByProps({ id: recordingIconId })
      .props.className.includes("iconPress");
    expect(iconPress).toBeTruthy();
  });

  it("mouseDown and mouseUp", () => {
    renderRecorderIcon();
    const button = testRenderer.root.findByProps({ id: recordingButtonId });
    button.props.onMouseDown();
    expect(mockStartRecording).toBeCalled();
    button.props.onMouseUp();
    expect(mockStopRecording).toBeCalled();
  });
});
