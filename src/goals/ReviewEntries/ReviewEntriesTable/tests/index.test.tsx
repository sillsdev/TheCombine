import { TableSortLabel } from "@mui/material";
import { MRT_TableHeadCell } from "material-react-table";
import { Provider } from "react-redux";
import { type ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { type Word } from "api/models";
import { defaultState } from "components/Project/ProjectReduxTypes";
import ReviewEntriesTable from "goals/ReviewEntries/ReviewEntriesTable";
import { type StoreState } from "types";
import { newSense, newWord } from "types/word";

jest.mock("@mui/material/Grow"); // For `columnFilterDisplayMode: "popover",`
jest.mock("uuid");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockUuid = require("uuid") as { v4: jest.Mock };

let uuidIndex = 0;
// getMockUuid(false) gives the next uuid to be assigned by our mocked v4.
function getMockUuid(increment = true): string {
  const uuid = `mockUuid${uuidIndex}`;
  if (increment) {
    uuidIndex++;
  }
  return uuid;
}

jest.mock("backend", () => ({
  getAllSpeakers: () => Promise.resolve([]),
  getFrontierWords: (...args: any[]) => mockGetFrontierWords(...args),
  getWord: () => jest.fn(),
}));
jest.mock("components/GoalTimeline/Redux/GoalActions", () => ({}));
jest.mock("goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditDialog");
jest.mock("types/hooks", () => ({
  ...jest.requireActual("types/hooks"),
  useAppDispatch: () => jest.fn(),
}));

const mockClickEvent = { stopPropagation: jest.fn() };
const mockGetFrontierWords = jest.fn();
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
const mockWords = (): Word[] => [
  { ...newWord("Alfa"), senses: [newSense("Echo")] },
  { ...newWord("Delta"), senses: [newSense("Foxtrot")] },
  { ...newWord("Bravo"), senses: [newSense("Hotel")] },
  { ...newWord("Charlie"), senses: [newSense("Golf")] },
];
/*const sortOrder = [
  [0, 2, 3, 1], // Vernacular
  [0, 1, 2, 3], // Senses
  [0, 1, 2, 3], // Definitions
  [0, 1, 3, 2], // Glosses
  [0, 1, 2, 3], // PartOfSpeech
  [0, 1, 2, 3], // Domains
  [0, 1, 2, 3], // Pronunciations
  [0, 1, 2, 3], // Note
  [0, 1, 2, 3], // Flag
];*/

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
  mockUuid.v4.mockImplementation(getMockUuid);
  mockGetFrontierWords.mockResolvedValue(mockWords());
}

beforeEach(() => {
  setMockFunctions();
});

describe("ReviewEntriesTable", () => {
  it("fetches frontier when it initializes", async () => {
    await renderReviewEntriesTable();
    expect(mockGetFrontierWords).toHaveBeenCalled();
  });

  describe("table sort", () => {
    beforeEach(async () => {
      await renderReviewEntriesTable(true, true);
    });

    test("table sort buttons for all columns", async () => {
      const sortButtons = renderer.root.findAllByType(TableSortLabel);
      expect(sortButtons).toHaveLength(9);
      for (const button of sortButtons) {
        expect(button.props.direction).toBeUndefined;
        await act(async () => {
          button.props.onClick(mockClickEvent);
        });
        expect(button.props.direction).toEqual("asc");
        await act(async () => {
          button.props.onClick(mockClickEvent);
        });
        expect(button.props.direction).toEqual("desc");
        await act(async () => {
          button.props.onClick(mockClickEvent);
        });
        expect(button.props.direction).toBeUndefined;
      }
    });

    // TODO: Add tests to verify the custom `sortingFn`s.
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
