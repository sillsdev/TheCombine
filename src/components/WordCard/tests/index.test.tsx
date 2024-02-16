import { ReactTestRenderer, act, create } from "react-test-renderer";

import "tests/reactI18nextMock";

import { Word } from "api/models";
import WordCard, { AudioSummary, buttonIdFull } from "components/WordCard";
import SenseCard from "components/WordCard/SenseCard";
import SummarySenseCard from "components/WordCard/SummarySenseCard";
import { newPronunciation, newSense, newWord } from "types/word";

// Mock the audio components
jest
  .spyOn(window.HTMLMediaElement.prototype, "pause")
  .mockImplementation(() => {});
jest.mock("components/Pronunciations/AudioPlayer", () => "div");
jest.mock("components/Pronunciations/Recorder");
jest.mock("components/WordCard/DomainChipsGrid", () => "div");

const mockWordId = "mock-id";
const buttonId = buttonIdFull(mockWordId);
const mockWord: Word = { ...newWord(), id: mockWordId };
const newAudio = ["song", "rap", "poem"].map((f) => newPronunciation(f));
mockWord.audio.push(...newAudio);
mockWord.senses.push(newSense(), newSense());

let cardHandle: ReactTestRenderer;

const renderHistoryCell = async (): Promise<void> => {
  await act(async () => {
    cardHandle = create(<WordCard word={mockWord} />);
  });
};

beforeEach(async () => {
  await renderHistoryCell();
});

describe("HistoryCell", () => {
  it("has summary and full views", async () => {
    const button = cardHandle.root.findByProps({ id: buttonId });
    expect(cardHandle.root.findByType(AudioSummary).props.count).toEqual(
      mockWord.audio.length
    );
    expect(cardHandle.root.findAllByType(SenseCard)).toHaveLength(0);
    expect(cardHandle.root.findAllByType(SummarySenseCard)).toHaveLength(1);

    await act(async () => {
      button.props.onClick();
    });
    expect(cardHandle.root.findAllByType(AudioSummary)).toHaveLength(0);
    expect(cardHandle.root.findAllByType(SenseCard)).toHaveLength(
      mockWord.senses.length
    );
    expect(cardHandle.root.findAllByType(SummarySenseCard)).toHaveLength(0);

    await act(async () => {
      button.props.onClick();
    });
    expect(cardHandle.root.findByType(AudioSummary).props.count).toEqual(
      mockWord.audio.length
    );
    expect(cardHandle.root.findAllByType(SenseCard)).toHaveLength(0);
    expect(cardHandle.root.findAllByType(SummarySenseCard)).toHaveLength(1);
  });
});
