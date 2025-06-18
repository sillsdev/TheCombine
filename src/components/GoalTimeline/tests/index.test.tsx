import { ThemeProvider } from "@mui/material";
import "@testing-library/jest-dom";
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
import { goalNameToGoal } from "utilities/goalUtilities";
import { setMatchMedia } from "utilities/testingLibraryUtilities";

jest.mock("backend", () => ({
  getCurrentPermissions: () => mockGetCurrentPermissions(),
  hasGraylistEntries: () => mockHasGraylistEntries(),
}));
jest.mock("components/Project/ProjectActions", () => ({}));
jest.mock("components/Pronunciations/Recorder");
jest.mock("goals/Redux/GoalActions", () => ({
  asyncAddGoal: (goal: Goal) => mockChooseGoal(goal),
  asyncGetUserEdits: () => jest.fn(),
}));
jest.mock("rootRedux/hooks", () => {
  return {
    ...jest.requireActual("rootRedux/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const mockChooseGoal = jest.fn();
const mockGetCurrentPermissions = jest.fn();
const mockHasGraylistEntries = jest.fn();

/** Total number of goal options, assuming all permissions and a graylist. */
const optionCount = implementedGoals.length;
/** `optionCount` +1 for a disabled history button. */
const noHistoryCount = optionCount + 1;

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
  it("has the expected number of buttons", async () => {
    await renderTimeline();
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(noHistoryCount);
  });

  it("has one fewer button if no graylist entry", async () => {
    mockHasGraylistEntries.mockResolvedValue(false);
    await renderTimeline();
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(noHistoryCount - 1);
  });

  it("has one fewer button if no CharInv permission", async () => {
    mockGetCurrentPermissions.mockResolvedValue([
      Permission.MergeAndReviewEntries,
    ]);
    await renderTimeline();
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(noHistoryCount - 1);
  });

  it("has the last button disabled for no history", async () => {
    await renderTimeline();
    const buttons = screen.queryAllByRole("button");
    expect(buttons[0]).toBeEnabled();
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });

  it("has a button for each history goal with changes", async () => {
    // Define goals with changes.
    const [ccic, cciw] = [new CreateCharInv(), new CreateCharInv()];
    ccic.changes = {
      charChanges: [["a", CharacterStatus.Undecided, CharacterStatus.Accepted]],
      wordChanges: [],
    };
    cciw.changes = {
      charChanges: [],
      wordChanges: [{ find: "b", replace: "c", words: {} }],
    };
    const [md, rdd] = [new MergeDups(), new ReviewDeferredDups()];
    md.changes = { merges: [{ parentIds: ["d"], childIds: ["e"] }] };
    rdd.changes = { merges: [{ parentIds: ["f"], childIds: ["g"] }] };
    const re = new ReviewEntries();
    re.changes = { entryEdits: [{ oldId: "h", newId: "i" }] };

    // Render with history containing goals both with and without changes.
    const changeless = implementedGoals.map(goalNameToGoal);
    await renderTimeline([ccic, cciw, md, ...changeless, rdd, re]);
    const historyCount = 5;

    // Verify that only history goals with changes have buttons, all enabled.
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(optionCount + historyCount);
    buttons.forEach((b) => expect(b).toBeEnabled());
  });

  it("selects a goal from suggestions", async () => {
    const goalName = implementedGoals[2];
    await renderTimeline();
    expect(mockChooseGoal).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText(`${goalName}.title`));
    expect(mockChooseGoal).toHaveBeenCalledTimes(1);
    const calledGoal = mockChooseGoal.mock.calls[0][0];
    expect(calledGoal.name).toEqual(goalName);
  });
});

async function renderTimeline(history: Goal[] = []): Promise<void> {
  const goalsState: GoalsState = { ...defaultState.goalsState, history };
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
