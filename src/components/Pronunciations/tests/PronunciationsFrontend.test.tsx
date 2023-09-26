import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import PronunciationsFrontend from "components/Pronunciations/PronunciationsFrontend";
import { defaultState as pronunciationsState } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import theme from "types/theme";

// Mock the audio components
jest
  .spyOn(window.HTMLMediaElement.prototype, "pause")
  .mockImplementation(() => {});
jest.mock("components/Pronunciations/Recorder");

// Test variables
let testRenderer: renderer.ReactTestRenderer;
const mockStore = configureMockStore()({ pronunciationsState });

describe("PronunciationsFrontend", () => {
  it("renders with record button and play buttons", () => {
    const audio = ["a.wav", "b.wav"];
    renderer.act(() => {
      testRenderer = renderer.create(
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Provider store={mockStore}>
              <PronunciationsFrontend
                pronunciationFiles={audio}
                deleteAudio={jest.fn()}
                uploadAudio={jest.fn()}
              />
            </Provider>
          </ThemeProvider>
        </StyledEngineProvider>
      );
    });
    expect(testRenderer.root.findAllByType(AudioRecorder)).toHaveLength(1);
    expect(testRenderer.root.findAllByType(AudioPlayer)).toHaveLength(
      audio.length
    );
  });
});
