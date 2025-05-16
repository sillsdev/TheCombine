import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import PronunciationsFrontend from "components/Pronunciations/PronunciationsFrontend";
import { defaultState } from "rootRedux/types";
import theme from "types/theme";
import { newPronunciation } from "types/word";

jest.mock("components/AppBar/SpeakerMenu", () => ({
  SpeakerMenuList: () => <div />,
}));
jest.mock("components/Dialogs", () => ({
  ButtonConfirmation: () => <div />,
}));

// Built-in data-testid values for the MUI Icons
const testIdPlay = "PlayArrowIcon";
const testIdRecord = "FiberManualRecordIcon";

describe("PronunciationsFrontend", () => {
  it("renders with record button and play buttons", async () => {
    const audio = ["a.wav", "b.wav"].map((f) => newPronunciation(f));
    await act(async () => {
      render(
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <Provider store={configureMockStore()(defaultState)}>
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
    expect(screen.queryByTestId(testIdRecord)).toBeTruthy();
    expect(screen.queryAllByTestId(testIdPlay)).toHaveLength(audio.length);
  });
});
