import { queryByText, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import { type Word } from "api/models";
import { playButtonLabel } from "components/Pronunciations/AudioPlayer";
import WordCard, { WordCardLabel } from "components/WordCard";
import { defaultState } from "rootRedux/types";
import {
  newDefinition,
  newFlag,
  newNote,
  newPronunciation,
  newSense,
  newWord,
} from "types/word";

const mockAudio = ["song", "rap", "poem", "sonnet", "aria", "psalm", "hymn"];
const mockDefinitionText = "definition goes here";
const mockFlagText = "flag text goes here";
const mockNoteText = "note text goes here";
const mockWordId = "mock-id";

const mockWord: Word = {
  ...newWord(),
  flag: newFlag(mockFlagText),
  id: mockWordId,
  note: newNote(mockNoteText),
};
const newAudio = mockAudio.map((f) => newPronunciation(f));
mockWord.audio.push(...newAudio);
mockWord.senses.push(
  { ...newSense(), definitions: [newDefinition(mockDefinitionText)] },
  newSense()
);

const renderWordCard = async (): Promise<void> => {
  await act(async () => {
    render(
      <Provider store={createMockStore()(defaultState)}>
        <WordCard word={mockWord} />
      </Provider>
    );
  });
};

beforeEach(async () => {
  await renderWordCard();
});

describe("WordCard", () => {
  it("has summary and full views", async () => {
    //const agent = userEvent.setup();

    /** Check that the summary view has the intended elements */
    const checkCondensed = (): void => {
      // Has pronunciations summary and no playable audio
      const audioSummary = screen.getByLabelText(
        WordCardLabel.ButtonAudioSummary
      );
      expect(queryByText(audioSummary, `${newAudio.length}`)).toBeTruthy();
      expect(screen.queryByLabelText(playButtonLabel)).toBeNull();
      // Has no definitions
      expect(screen.queryByText(mockDefinitionText)).toBeNull();
      // Has flag hover-text but not regular text
      expect(screen.queryByLabelText(mockFlagText)).toBeTruthy();
      expect(screen.queryByText(mockFlagText)).toBeNull();
      // Has note hover-text but not regular text
      expect(screen.queryByLabelText(mockNoteText)).toBeTruthy();
      expect(screen.queryByText(mockNoteText)).toBeNull();
      // Has expand button, not condense button
      expect(screen.queryByLabelText(WordCardLabel.ButtonExpand)).toBeTruthy();
      expect(screen.queryByLabelText(WordCardLabel.ButtonCondense)).toBeNull();
    };

    /** Check that the full view has the intended elements */
    /*const checkExpanded = (): void => {
      // Has playable audio and no pronunciations summary
      expect(screen.queryAllByLabelText(playButtonLabel)).toHaveLength(
        newAudio.length
      );
      expect(
        screen.queryByLabelText(WordCardLabel.ButtonAudioSummary)
      ).toBeNull();
      // Has definitions
      expect(screen.queryByText(mockDefinitionText)).toBeTruthy();
      // Has flag hover-text and regular text
      expect(screen.queryByLabelText(mockFlagText)).toBeTruthy();
      expect(screen.queryByText(mockFlagText)).toBeTruthy();
      // Has note hover-text and regular text
      expect(screen.queryByLabelText(mockNoteText)).toBeTruthy();
      expect(screen.queryByText(mockNoteText)).toBeTruthy();
      // Has condense button, not expand button
      expect(screen.queryByLabelText(WordCardLabel.ButtonExpand)).toBeNull();
      expect(
        screen.queryByLabelText(WordCardLabel.ButtonCondense)
      ).toBeTruthy();
    };*/

    checkCondensed();
    /*await agent.click(screen.getByLabelText(WordCardLabel.ButtonExpand));
    checkExpanded();
    await agent.click(screen.getByLabelText(WordCardLabel.ButtonCondense));
    checkCondensed();*/
  });
});
