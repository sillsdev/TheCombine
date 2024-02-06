import { MRT_TableHeadCell } from "material-react-table";
import { Provider } from "react-redux";
import { type ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { defaultState } from "components/Project/ProjectReduxTypes";
import ReviewEntriesTable from "goals/ReviewEntries/ReviewEntriesTable";
import { type StoreState } from "types";
import { newWord } from "types/word";

const mockGetFrontierWords = jest.fn();
const mockUuid = jest.fn();

jest.mock("@mui/material/Grow"); // For `columnFilterDisplayMode: "popover",`
jest.mock("uuid", () => ({ v4: () => mockUuid() }));

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
const mockWords = [newWord()];

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
  mockGetFrontierWords.mockResolvedValue(mockWords);
}

beforeEach(() => {
  setMockFunctions();
  for (const word of mockWords) {
    for (const sense of word.senses) {
      mockUuid.mockImplementationOnce(() => sense.guid);
    }
  }
});

describe("ReviewEntriesTable", () => {
  it("fetches frontier when it initializes", async () => {
    await renderReviewEntriesTable();
    expect(mockGetFrontierWords).toHaveBeenCalled();
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
