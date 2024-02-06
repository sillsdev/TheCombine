import { Provider } from "react-redux";
import { act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { CurrentProjectState } from "components/Project/ProjectReduxTypes";
import ReviewEntriesTable from "goals/ReviewEntries/ReviewEntriesTable";
import { newProject } from "types/project";
import { newWord } from "types/word";
import { defaultWritingSystem } from "types/writingSystem";

const mockGetFrontierWords = jest.fn();
const mockUuid = jest.fn();

jest.mock("@mui/material/Grow"); // For `columnFilterDisplayMode: "popover",`
jest.mock("uuid", () => ({ v4: () => mockUuid() }));

jest.mock("backend", () => ({
  getAllSpeakers: () => Promise.resolve([]),
  getFrontierWords: (...args: any[]) => mockGetFrontierWords(...args),
}));
jest.mock("components/GoalTimeline/Redux/GoalActions", () => ({}));
jest.mock("types/hooks", () => ({
  ...jest.requireActual("types/hooks"),
  useAppDispatch: () => jest.fn(),
}));

// Mock store + axios
const mockWords = [newWord()];
const currentProjectState: Partial<CurrentProjectState> = {
  project: {
    ...newProject(),
    analysisWritingSystems: [defaultWritingSystem],
    definitionsEnabled: true,
    grammaticalInfoEnabled: true,
    vernacularWritingSystem: defaultWritingSystem,
  },
};
const mockStore = configureMockStore()({ currentProjectState });

function setMockFunctions(): void {
  jest.clearAllMocks();
  mockGetFrontierWords.mockResolvedValue(mockWords);
}

beforeEach(async () => {
  // Prep for component creation
  setMockFunctions();
  for (const word of mockWords) {
    for (const sense of word.senses) {
      mockUuid.mockImplementationOnce(() => sense.guid);
    }
  }

  await act(async () => {
    create(
      <Provider store={mockStore}>
        <ReviewEntriesTable />
      </Provider>
    );
  });
});

describe("ReviewEntriesTable", () => {
  it("fetches frontier when it initializes", () => {
    expect(mockGetFrontierWords).toHaveBeenCalled();
  });
});
