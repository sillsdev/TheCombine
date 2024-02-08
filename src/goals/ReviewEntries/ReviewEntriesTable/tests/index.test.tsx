import { TableSortLabel } from "@mui/material";
import { MRT_TableBodyRow, MRT_TableHeadCell } from "material-react-table";
import { Provider } from "react-redux";
import { type ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { defaultState } from "components/Project/ProjectReduxTypes";
import ReviewEntriesTable from "goals/ReviewEntries/ReviewEntriesTable";
import VernacularCell from "goals/ReviewEntries/ReviewEntriesTable/Cells/VernacularCell";
import {
  mockWords,
  sortOrder,
} from "goals/ReviewEntries/ReviewEntriesTable/tests/WordsMock";
import { type StoreState } from "types";

jest.mock("@mui/material/Grow"); // For `columnFilterDisplayMode: "popover",`

jest.mock("backend", () => ({
  getAllSpeakers: (projectId: string) => mockGetAllSpeakers(projectId),
  getFrontierWords: (...args: any[]) => mockGetFrontierWords(...args),
  getWord: (wordId: string) => mockGetWord(wordId),
}));
jest.mock("components/Pronunciations/PronunciationsBackend");
jest.mock("types/hooks", () => ({
  ...jest.requireActual("types/hooks"),
  useAppDispatch: () => jest.fn(),
}));

const mockClickEvent = { stopPropagation: jest.fn() };
const mockGetAllSpeakers = jest.fn();
const mockGetFrontierWords = jest.fn();
const mockGetWord = jest.fn();
const mockState = (
  definitionsEnabled = false,
  grammaticalInfoEnabled = false
): Partial<StoreState> => ({
  currentProjectState: {
    ...defaultState,
    project: {
      ...defaultState.project,
      definitionsEnabled,
      grammaticalInfoEnabled,
    },
  },
});

let renderer: ReactTestRenderer;

const renderReviewEntriesTable = async (
  definitionsEnabled = false,
  grammaticalInfoEnabled = false
): Promise<void> => {
  const mockStore = configureMockStore()(
    mockState(definitionsEnabled, grammaticalInfoEnabled)
  );
  await act(async () => {
    renderer = create(
      <Provider store={mockStore}>
        <ReviewEntriesTable />
      </Provider>
    );
  });
};

function setMockFunctions(): void {
  jest.clearAllMocks();
  mockGetAllSpeakers.mockResolvedValue([]);
  mockGetFrontierWords.mockResolvedValue(mockWords());
}

beforeEach(() => {
  setMockFunctions();
});

describe("ReviewEntriesTable", () => {
  test("initial render fetches frontier and loads data", async () => {
    await renderReviewEntriesTable();
    expect(mockGetFrontierWords).toHaveBeenCalled();
    expect(renderer.root.findAllByType(MRT_TableBodyRow)).toHaveLength(4);
  });

  describe("table sort", () => {
    beforeEach(async () => {
      await renderReviewEntriesTable(true, true);
    });

    const checkRowOrder = (col: number, dir: "asc" | "desc"): void => {
      const rowIds = renderer.root
        .findAllByType(VernacularCell)
        .map((cell) => cell.props.word.id);
      const order = [...sortOrder[col]];
      if (dir === "desc") {
        order.reverse();
      }
      order.forEach((id, index) => {
        expect(rowIds[index]).toEqual(`${id}`);
      });
    };

    /** The accessor columns in default order. */
    const cols = [
      "Vernacular",
      "Senses",
      "Definitions",
      "Glosses",
      "PartOfSpeech",
      "Domains",
      "Pronunciations",
      "Note",
      "Flag",
    ];

    cols.forEach((col, i) => {
      test(`sorting by ${col} column`, async () => {
        const button = renderer.root.findAllByType(TableSortLabel)[i];
        expect(button.props.direction).toBeUndefined;
        await act(async () => {
          button.props.onClick(mockClickEvent);
        });
        expect(button.props.direction).toEqual("asc");
        checkRowOrder(i, "asc");
        await act(async () => {
          button.props.onClick(mockClickEvent);
        });
        expect(button.props.direction).toEqual("desc");
        checkRowOrder(i, "desc");
        await act(async () => {
          button.props.onClick(mockClickEvent);
        });
        expect(button.props.direction).toBeUndefined;
      });
    });
  });

  describe("definitionsEnabled & grammaticalInfoEnabled", () => {
    const definitionsId = "definitions";
    const partOfSpeechId = "partOfSpeech";

    test("show definitions when definitionsEnabled is true", async () => {
      await renderReviewEntriesTable(true, false);
      const colIds = renderer.root
        .findAllByType(MRT_TableHeadCell)
        .map((col) => col.props.header.id);
      expect(colIds).toContain(definitionsId);
      expect(colIds).not.toContain(partOfSpeechId);
    });

    test("show part of speech when grammaticalInfoEnabled is true", async () => {
      await renderReviewEntriesTable(false, true);
      const colIds = renderer.root
        .findAllByType(MRT_TableHeadCell)
        .map((col) => col.props.header.id);
      expect(colIds).not.toContain(definitionsId);
      expect(colIds).toContain(partOfSpeechId);
    });
  });
});
