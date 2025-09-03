import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import "@testing-library/jest-dom";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { Word } from "api/models";
import RecentEntry, {
  RecentEntryIdPrefix,
} from "components/DataEntry/DataEntryTable/RecentEntry";
import { defaultState } from "rootRedux/types";
import theme from "types/theme";
import { newPronunciation, simpleWord } from "types/word";
import { newWritingSystem } from "types/writingSystem";

jest.mock("i18n", () => ({})); // else `thrown: "Error: AggregateError`

const mockStore = configureMockStore()(defaultState);
const mockVern = "Vernacular";
const mockGloss = "Gloss";
const mockWord = simpleWord(mockVern, mockGloss);
const mockText = "Test text";
const mockUpdateGloss = jest.fn();
const mockUpdateNote = jest.fn();
const mockUpdateVern = jest.fn();

async function renderWithWord(word: Word): Promise<void> {
  await act(async () => {
    render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <RecentEntry
              entry={word}
              rowIndex={0}
              senseGuid={word.senses[0].guid}
              updateGloss={mockUpdateGloss}
              updateNote={mockUpdateNote}
              updateVern={mockUpdateVern}
              removeEntry={jest.fn()}
              addAudioToWord={jest.fn()}
              delAudioFromWord={jest.fn()}
              repAudioInWord={jest.fn()}
              focusNewEntry={jest.fn()}
              analysisLang={newWritingSystem()}
              vernacularLang={newWritingSystem()}
            />
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
}

beforeEach(() => {
  jest.resetAllMocks();
});

afterEach(cleanup);

// Use regex for id matching to allow for added row index.
const deleteButtonIdRegEx = new RegExp(RecentEntryIdPrefix.ButtonDelete);
const noteButtonIdRegEx = new RegExp(RecentEntryIdPrefix.ButtonNote);
const noteConfirmButtonText = "buttons.confirm";
const playIconId = "PlayArrowIcon";
const recordButtonId = "recordingButton";

describe("ExistingEntry", () => {
  const getVernAndGlossFields = (): {
    vernField: HTMLElement;
    glossField: HTMLElement;
  } => {
    const vernAndGlossFields = screen.getAllByRole("combobox");
    expect(vernAndGlossFields).toHaveLength(2);
    const [vernField, glossField] = vernAndGlossFields;
    return { vernField, glossField };
  };

  describe("component", () => {
    it("renders recorder and no players", async () => {
      await renderWithWord(mockWord);
      expect(screen.queryByTestId(playIconId)).toBeNull();
      expect(screen.getByTestId(recordButtonId)).toBeTruthy();
    });

    it("renders recorder and 3 players", async () => {
      const audio = ["a.wav", "b.wav", "c.wav"].map((f) => newPronunciation(f));
      await renderWithWord({ ...mockWord, audio });
      expect(screen.getAllByTestId(playIconId).length).toEqual(3);
      expect(screen.getByTestId(recordButtonId)).toBeTruthy();
    });
  });

  describe("vernacular", () => {
    it("disables buttons if changing", async () => {
      await renderWithWord(mockWord);
      const { vernField } = getVernAndGlossFields();
      const note = screen.getByTestId(noteButtonIdRegEx);
      const audio = screen.getByTestId(recordButtonId);
      const del = screen.getByTestId(deleteButtonIdRegEx);

      expect(note).toBeEnabled();
      expect(audio).toBeEnabled();
      expect(del).toBeEnabled();

      await userEvent.clear(vernField);
      await userEvent.type(vernField, mockText);
      expect(note).toBeDisabled();
      expect(audio).toBeDisabled();
      expect(del).toBeDisabled();

      await userEvent.clear(vernField);
      await userEvent.type(vernField, mockVern);
      expect(note).toBeEnabled();
      expect(audio).toBeEnabled();
      expect(del).toBeEnabled();
    });

    it("updates if changed", async () => {
      await renderWithWord(mockWord);
      const { vernField, glossField } = getVernAndGlossFields();

      await userEvent.clear(vernField);
      await userEvent.type(vernField, mockVern);
      await userEvent.click(glossField);
      expect(mockUpdateVern).toHaveBeenCalledTimes(0);

      await userEvent.clear(vernField);
      await userEvent.type(vernField, mockText);
      await userEvent.click(glossField);
      expect(mockUpdateVern).toHaveBeenCalledWith(0, mockText);
    });
  });

  describe("gloss", () => {
    it("disables buttons if changing", async () => {
      await renderWithWord(mockWord);
      const { glossField } = getVernAndGlossFields();
      const note = screen.getByTestId(noteButtonIdRegEx);
      const audio = screen.getByTestId(recordButtonId);
      const del = screen.getByTestId(deleteButtonIdRegEx);

      expect(note).toBeEnabled();
      expect(audio).toBeEnabled();
      expect(del).toBeEnabled();

      await userEvent.clear(glossField);
      await userEvent.type(glossField, mockText);
      expect(note).toBeDisabled();
      expect(audio).toBeDisabled();
      expect(del).toBeDisabled();

      await userEvent.clear(glossField);
      await userEvent.type(glossField, mockGloss);
      expect(note).toBeEnabled();
      expect(audio).toBeEnabled();
      expect(del).toBeEnabled();
    });

    it("updates if changed", async () => {
      await renderWithWord(mockWord);
      const { vernField, glossField } = getVernAndGlossFields();

      await userEvent.clear(glossField);
      await userEvent.type(glossField, mockGloss);
      await userEvent.click(vernField);
      expect(mockUpdateGloss).toHaveBeenCalledTimes(0);

      await userEvent.clear(glossField);
      await userEvent.type(glossField, mockText);
      await userEvent.click(vernField);
      expect(mockUpdateGloss).toHaveBeenCalledWith(0, mockText);
    });
  });

  describe("note", () => {
    it("updates text", async () => {
      await renderWithWord(mockWord);
      await userEvent.click(screen.getByTestId(noteButtonIdRegEx));
      const dialog = screen.getByRole("dialog");
      const noteField = within(dialog).getByRole("textbox");
      await userEvent.type(noteField, mockText);
      await userEvent.click(screen.getByText(noteConfirmButtonText));
      expect(mockUpdateNote).toHaveBeenCalledWith(0, mockText);
    });
  });
});
