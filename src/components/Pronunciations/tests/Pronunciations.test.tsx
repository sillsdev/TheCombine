import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/mockReactI18next";

import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import Pronunciations from "components/Pronunciations/PronunciationsComponent";
import { defaultState } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import theme from "types/theme";

jest.mock("components/Pronunciations/Recorder");
jest
  .spyOn(window.HTMLMediaElement.prototype, "pause")
  .mockImplementation(() => {});

let testRenderer: renderer.ReactTestRenderer;
const mockAudioFiles = ["a.wav", "b.wav"];

const renderPronunciations = (recordingConsented = true): void => {
  const store = configureMockStore()({
    currentProjectState: { project: { recordingConsented } },
    pronunciationsState: defaultState,
  });
  renderer.act(() => {
    testRenderer = renderer.create(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <Pronunciations
              wordId="wordId"
              pronunciationFiles={mockAudioFiles}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
};

describe("Pronunciations", () => {
  it("renders one record button and one play button for each pronunciation file", () => {
    renderPronunciations();
    expect(testRenderer.root.findAllByType(AudioRecorder)).toHaveLength(1);
    expect(testRenderer.root.findAllByType(AudioPlayer)).toHaveLength(
      mockAudioFiles.length
    );
  });

  it("renders no record button if project.recordingConsented is false", () => {
    renderPronunciations(false);
    expect(testRenderer.root.findAllByType(AudioRecorder)).toHaveLength(0);
    expect(testRenderer.root.findAllByType(AudioPlayer)).toHaveLength(
      mockAudioFiles.length
    );
  });

  it("displays buttons to match snapshot", () => {
    renderPronunciations();
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });
});
