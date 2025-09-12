import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import { defaultState } from "rootRedux/types";
import theme from "types/theme";
import { newPronunciation } from "types/word";

jest.mock("components/AppBar/SpeakerMenu", () => ({
  SpeakerMenuList: () => <div />,
}));

// Test variables
const mockAudio = ["a.wav", "b.wav"].map((f) => newPronunciation(f));
const mockStore = configureMockStore()(defaultState);

// Built-in data-testid values for the MUI Icons
const testIdPlay = "PlayArrowIcon";
const testIdRecord = "FiberManualRecordIcon";

const renderPronunciationsBackend = async (
  withRecord: boolean
): Promise<void> => {
  await act(async () => {
    render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <PronunciationsBackend
              audio={mockAudio}
              playerOnly={!withRecord}
              wordId="mock-id"
              deleteAudio={jest.fn()}
              replaceAudio={jest.fn()}
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
    expect(screen.queryByTestId(testIdRecord)).toBeTruthy();
    expect(screen.queryAllByTestId(testIdPlay)).toHaveLength(mockAudio.length);
  });

  it("renders without a record button and with play buttons", async () => {
    await renderPronunciationsBackend(false);
    expect(screen.queryByTestId(testIdRecord)).toBeNull();
    expect(screen.queryAllByTestId(testIdPlay)).toHaveLength(mockAudio.length);
  });
});
