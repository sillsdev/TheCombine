import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import PronunciationsFrontend from "components/Pronunciations/PronunciationsFrontend";
import theme from "types/theme";
import { newPronunciation } from "types/word";

// Test variables
let testRenderer: renderer.ReactTestRenderer;
const mockStore = configureMockStore()(defaultState);

describe("PronunciationsFrontend", () => {
  it("renders with record button and play buttons", async () => {
    const audio = ["a.wav", "b.wav"].map((f) => newPronunciation(f));
    await renderer.act(async () => {
      testRenderer = renderer.create(
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Provider store={mockStore}>
              <PronunciationsFrontend
                audio={audio}
                deleteAudio={jest.fn()}
                replaceAudio={jest.fn()}
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
