import { ThemeProvider } from "@mui/material";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import { Permission } from "api/models";
import GoalTimeline from "components/GoalTimeline";
import {
  CharacterStatus,
  CreateCharInv,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import {
  MergeDups,
  ReviewDeferredDups,
} from "goals/MergeDuplicates/MergeDupsTypes";
import { implementedGoals, type GoalsState } from "goals/Redux/GoalReduxTypes";
import { ReviewEntries } from "goals/ReviewEntries/ReviewEntriesTypes";
import { defaultState } from "rootRedux/types";
import { Goal } from "types/goals";
import theme from "types/theme";
import { setMatchMedia } from "utilities/testingLibraryUtilities";

jest.mock("backend", () => ({
  getCurrentPermissions: () => mockGetCurrentPermissions(),
  hasGraylistEntries: () => mockHasGraylistEntries(),
}));
jest.mock("components/Pronunciations/Recorder");
jest.mock("goals/Redux/GoalActions", () => ({
  asyncAddGoal: (goal: Goal) => mockChooseGoal(goal),
  asyncGetUserEdits: () => jest.fn(),
}));
jest.mock("components/Project/ProjectActions", () => ({}));
jest.mock("rootRedux/hooks", () => {
  return {
    ...jest.requireActual("rootRedux/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const mockChooseGoal = jest.fn();
const mockGetCurrentPermissions = jest.fn();
const mockHasGraylistEntries = jest.fn();

beforeAll(async () => {
  // Required (along with a `ThemeProvider`) for `useMediaQuery` to work
  setMatchMedia();
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentPermissions.mockResolvedValue([
    Permission.CharacterInventory,
    Permission.MergeAndReviewEntries,
  ]);
  mockHasGraylistEntries.mockResolvedValue(true);
});

describe("GoalTimeline", () => {
  it("has the expected number of buttons plus 1 for empty history", async () => {
    await renderTimeline(implementedGoals);
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(implementedGoals.length + 1);
  });

  it("has one fewer button if no graylist entry", async () => {
    mockHasGraylistEntries.mockResolvedValue(false);
    await renderTimeline(implementedGoals);
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(implementedGoals.length);
  });

  it("only shows goal history for goals with changes", async () => {
    const cci = new CreateCharInv();
    cci.changes = {
      charChanges: [["a", CharacterStatus.Undecided, CharacterStatus.Accepted]],
      wordChanges: [],
    };
    const md = new MergeDups();
    md.changes = { merges: [{ parentIds: ["b"], childIds: ["c"] }] };
    const rdd = new ReviewDeferredDups();
    rdd.changes = { merges: [{ parentIds: ["d"], childIds: ["e"] }] };
    const re = new ReviewEntries();
    re.changes = { entryEdits: [{ oldId: "f", newId: "g" }] };
    const history = [
      new CreateCharInv(),
      cci,
      new MergeDups(),
      md,
      new ReviewDeferredDups(),
      rdd,
      new ReviewEntries(),
      re,
    ];

    await renderTimeline(implementedGoals, history);
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(implementedGoals.length + 4);
  });

  it("selects a goal from suggestions", async () => {
    const goalNum = 2;
    await renderTimeline();
    await userEvent.click(
      screen.getByText(`${implementedGoals[goalNum]}.title`)
    );
    expect(mockChooseGoal).toHaveBeenCalledTimes(1);
    const calledGoalName = mockChooseGoal.mock.calls[0][0].name;
    expect(calledGoalName).toEqual(implementedGoals[goalNum]);
  });
});

async function renderTimeline(
  allGoals = [...implementedGoals],
  history: Goal[] = []
): Promise<void> {
  const goalsState: GoalsState = {
    ...defaultState.goalsState,
    allGoals,
    history,
  };
  await act(async () => {
    render(
      <ThemeProvider theme={theme}>
        <Provider store={createMockStore()({ ...defaultState, goalsState })}>
          <GoalTimeline />
        </Provider>
      </ThemeProvider>
    );
  });
}
