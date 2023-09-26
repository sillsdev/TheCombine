import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import { defaultState as pronunciationsState } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import theme from "types/theme";

// Mock the audio components
jest
  .spyOn(window.HTMLMediaElement.prototype, "pause")
  .mockImplementation(() => {});
jest.mock("components/Pronunciations/Recorder");

// Test variables
let testRenderer: renderer.ReactTestRenderer;
const mockAudio = ["a.wav", "b.wav"];
const mockStore = configureMockStore()({ pronunciationsState });

const renderPronunciationsBackend = async (withRecord: boolean) => {
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <PronunciationsBackend
              playerOnly={!withRecord}
              pronunciationFiles={mockAudio}
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
