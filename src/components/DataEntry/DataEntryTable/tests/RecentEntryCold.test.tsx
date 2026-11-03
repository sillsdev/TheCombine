import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import "@testing-library/jest-dom";
import { act, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { Word } from "api/models";
import { RecentEntryIdPrefix } from "components/DataEntry/DataEntryTable/RecentEntry";
import RecentEntryCold, {
  RecentEntryColdTextId,
} from "components/DataEntry/DataEntryTable/RecentEntryCold";
import { WordCardLabel } from "components/WordCard";
import { defaultState } from "rootRedux/types";
import theme from "types/theme";
import { newGloss, newNote, newPronunciation, simpleWord } from "types/word";
import { newWritingSystem } from "types/writingSystem";

jest.mock("i18n", () => ({})); // else `thrown: "Error: AggregateError`

const mockStore = configureMockStore()(defaultState);
const mockVern = "Vernacular";
const mockGloss = "Gloss";
const mockOtherGloss = "Other gloss";
const mockNoteText = "Note text";
const mockWord = (): Word => simpleWord(mockVern, mockGloss);

const noteButtonId = `${RecentEntryIdPrefix.ButtonNote}0`;

async function renderWithWord(word: Word): Promise<void> {
  await act(async () => {
    render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <RecentEntryCold
              analysisLang={newWritingSystem()}
              entry={word}
              rowIndex={0}
              senseGuid={word.senses[0].guid}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
}

describe("RecentEntryCold", () => {
  it("renders the vernacular and the first gloss", async () => {
    const word = mockWord();
    word.senses[0].glosses.push(newGloss(mockOtherGloss, "other-lang"));
    await renderWithWord(word);

    expect(screen.getByText(mockVern)).toBeTruthy();
    expect(screen.getByText(mockGloss)).toBeTruthy();
    expect(screen.queryByText(mockOtherGloss)).toBeNull();
  });

  it("has an accessible label on the edit affordance", async () => {
    await renderWithWord(mockWord());
    expect(screen.getByLabelText(RecentEntryColdTextId.IconEdit)).toBeTruthy();
  });

  it("has no note indicator when there is no note text", async () => {
    await renderWithWord(mockWord());
    expect(screen.queryByTestId(noteButtonId)).toBeNull();
  });

  it("has a note indicator when there is note text", async () => {
    await renderWithWord({ ...mockWord(), note: newNote(mockNoteText) });
    expect(screen.getByTestId(noteButtonId)).toBeTruthy();
    expect(screen.getByTestId(noteButtonId)).toBeDisabled();
  });

  it("has no audio summary when there is no audio", async () => {
    await renderWithWord(mockWord());
    expect(
      screen.queryByLabelText(WordCardLabel.ButtonAudioSummary)
    ).toBeNull();
  });

  it("shows the audio count", async () => {
    const audio = ["a.wav", "b.wav", "c.wav"].map((f) => newPronunciation(f));
    await renderWithWord({ ...mockWord(), audio });
    const summary = screen.getByLabelText(WordCardLabel.ButtonAudioSummary);
    expect(within(summary).getByText(`${audio.length}`)).toBeTruthy();
  });
});
