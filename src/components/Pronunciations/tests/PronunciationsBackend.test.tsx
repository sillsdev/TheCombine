import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { defaultState } from "components/App/DefaultState";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import theme from "types/theme";
import { newPronunciation } from "types/word";

// Test variables
let testRenderer: ReactTestRenderer;
const mockAudio = ["a.wav", "b.wav"].map((f) => newPronunciation(f));
const mockStore = configureMockStore()(defaultState);

const renderPronunciationsBackend = async (
  withRecord: boolean
): Promise<void> => {
  await act(async () => {
    testRenderer = create(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <PronunciationsBackend
              audio={mockAudio}
              playerOnly={!withRecord}
              wordId="mock-id"
              deleteAudio={jest.fn()}
              uploadAudio={withRecord ? jest.fn() : undefined}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
};

describe("PronunciationsBackend", () => {
  it("renders with record button and play buttons", async () => {
    await renderPronunciationsBackend(true);
    expect(testRenderer.root.findAllByType(AudioRecorder)).toHaveLength(1);
    expect(testRenderer.root.findAllByType(AudioPlayer)).toHaveLength(
      mockAudio.length
    );
  });

  it("renders without a record button and with play buttons", async () => {
    await renderPronunciationsBackend(false);
    expect(testRenderer.root.findAllByType(AudioRecorder)).toHaveLength(0);
    expect(testRenderer.root.findAllByType(AudioPlayer)).toHaveLength(
      mockAudio.length
    );
  });
});
