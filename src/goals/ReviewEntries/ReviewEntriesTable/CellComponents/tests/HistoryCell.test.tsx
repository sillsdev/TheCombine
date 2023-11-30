import { Container } from "@mui/material";
import { ReactTestRenderer, act, create } from "react-test-renderer";

import "tests/reactI18nextMock";

import { Pedigree } from "api";
import WordCard from "components/WordCard";
import HistoryCell, {
  buttonId,
  buttonIdExit,
} from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/HistoryCell";
import { newWord } from "types/word";

// Dialog uses portals, which are not supported in react-test-renderer.
jest.mock("@mui/material", () => {
  const materialUiCore = jest.requireActual("@mui/material");
  return {
    ...jest.requireActual("@mui/material"),
    Dialog: materialUiCore.Container,
  };
});

// Mock the audio components
jest
  .spyOn(window.HTMLMediaElement.prototype, "pause")
  .mockImplementation(() => {});
jest.mock("components/Pronunciations/Recorder");

jest.mock("backend", () => ({
  getWordHistory: () => mockGetWordHistory(),
}));

const mockGetWordHistory = jest.fn();

const mockWord = newWord();
mockWord.id = "mock-id";
const buttonIdHistory = buttonId(mockWord.id);
const mockPedigree = (id?: string): Pedigree => ({
  word: id ? { ...newWord(), id } : mockWord,
  parents: [],
});

let cellHandle: ReactTestRenderer;

const renderHistoryCell = async (): Promise<void> => {
  await act(async () => {
    cellHandle = create(<HistoryCell historyCount={1} wordId={mockWord.id} />);
  });
};

beforeEach(async () => {
  jest.clearAllMocks();
  await renderHistoryCell();
});

describe("HistoryCell", () => {
  it("opens and closes", async () => {
    const dialog = cellHandle.root.findByType(Container);
    const historyButton = cellHandle.root.findByProps({ id: buttonIdHistory });
    const exitButton = cellHandle.root.findByProps({ id: buttonIdExit });

    expect(dialog.props.open).toBeFalsy();
    mockGetWordHistory.mockResolvedValueOnce(undefined);
    await act(async () => {
      historyButton.props.onClick();
    });
    expect(dialog.props.open).toBeFalsy();
    mockGetWordHistory.mockResolvedValue(mockPedigree());
    await act(async () => {
      historyButton.props.onClick();
    });
    expect(dialog.props.open).toBeTruthy();
    await act(async () => {
      exitButton.props.onClick();
    });
    expect(dialog.props.open).toBeFalsy();
  });

  it("has one card per word", async () => {
    // set up a 4-word pedigree
    const pedigree = mockPedigree();
    pedigree.parents.push(mockPedigree("father"), mockPedigree("mother"));
    pedigree.parents[0].parents.push(mockPedigree("babushka"));
    mockGetWordHistory.mockResolvedValue(pedigree);

    await act(async () => {
      cellHandle.root.findByProps({ id: buttonIdHistory }).props.onClick();
    });
    expect(cellHandle.root.findAllByType(WordCard)).toHaveLength(4);
  });
});
