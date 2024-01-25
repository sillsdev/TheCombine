import { Provider } from "react-redux";
import { act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import ReviewEntries from "goals/ReviewEntries";
import { newWord } from "types/word";
import { defaultWritingSystem } from "types/writingSystem";

const mockGetFrontierWords = jest.fn();
const mockUuid = jest.fn();

// Standard dialog mock-out.
jest.mock("@mui/material", () => {
  const material = jest.requireActual("@mui/material");
  return {
    ...material,
    Dialog: material.Container,
  };
});

jest.mock("notistack", () => ({
  ...jest.requireActual("notistack"),
  enqueueSnackbar: jest.fn(),
}));
jest.mock("uuid", () => ({ v4: () => mockUuid() }));
jest.mock("backend", () => ({
  getAllSpeakers: () => Promise.resolve([]),
  getFrontierWords: (...args: any[]) => mockGetFrontierWords(...args),
}));
jest.mock("components/TreeView", () => "div");
jest.mock("components/GoalTimeline/Redux/GoalActions", () => ({}));
jest.mock("types/hooks", () => ({
  useAppDispatch: () => jest.fn(),
}));

// Mock store + axios
const mockWords = [newWord()];
const state = {
  currentProjectState: {
    project: {
      analysisWritingSystems: [defaultWritingSystem],
      definitionsEnabled: true,
      vernacularWritingSystem: defaultWritingSystem,
    },
  },
  treeViewState: {
    open: false,
    currentDomain: { id: "number", name: "domain", subdomains: [] },
  },
};
const mockStore = configureMockStore()(state);

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
        <ReviewEntries completed={false} />
      </Provider>
    );
  });
});

describe("ReviewEntries", () => {
  it("Initializes correctly", () => {
    expect(mockGetFrontierWords).toHaveBeenCalled();
  });
});
