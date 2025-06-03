import { ThemeProvider } from "@mui/material";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import { Permission } from "api/models";
import GoalTimeline, { createSuggestionData } from "components/GoalTimeline";
import { implementedTypes, type GoalsState } from "goals/Redux/GoalReduxTypes";
import { defaultState } from "rootRedux/types";
import { Goal } from "types/goals";
import theme from "types/theme";
import { goalTypeToGoal } from "utilities/goalUtilities";
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

const allGoals = implementedTypes.map((t) => goalTypeToGoal(t));
const goalWithAnyGuid = (g: Goal): Goal => ({ ...g, guid: expect.any(String) });
const allGoalsWithAnyGuids = allGoals.map(goalWithAnyGuid);

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
  mockHasGraylistEntries.mockResolvedValue(false);
});

describe("GoalTimeline", () => {
  it("has the expected number of buttons", async () => {
    await renderTimeline(implementedTypes, allGoals);
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(implementedTypes.length + allGoals.length);
  });

  it("has one more button if there's a graylist entry", async () => {
    mockHasGraylistEntries.mockResolvedValue(true);
    await renderTimeline(implementedTypes, allGoals);
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(implementedTypes.length + allGoals.length + 1);
  });

  it("selects a goal from suggestions", async () => {
    const goalNum = 2;
    await renderTimeline();
    await userEvent.click(screen.getByText(`${allGoals[goalNum].name}.title`));
    expect(mockChooseGoal).toHaveBeenCalledTimes(1);
    expect(mockChooseGoal.mock.calls[0][0].goalType).toEqual(
      implementedTypes[goalNum]
    );
  });

  describe("createSuggestionData", () => {
    it("don't suggests goal types that aren't available", () => {
      const suggestions = createSuggestionData([], implementedTypes);
      expect(suggestions).toEqual([]);
    });

    it("appends non-suggested available goal types to the end", () => {
      const sliceIndex = 2;
      const suggestions = createSuggestionData(
        implementedTypes,
        implementedTypes.slice(sliceIndex)
      );
      const expectedGoals = [
        ...allGoalsWithAnyGuids.slice(sliceIndex),
        ...allGoalsWithAnyGuids.slice(0, sliceIndex),
      ];
      expect(suggestions).toEqual(expectedGoals.map((g) => g.name));
    });

    it("has a fallback for empty suggestion data", () => {
      const suggestions = createSuggestionData(implementedTypes, []);
      expect(suggestions).toEqual(allGoalsWithAnyGuids.map((g) => g.name));
    });
  });
});

async function renderTimeline(
  goalTypeSuggestions = [...implementedTypes],
  history: Goal[] = []
): Promise<void> {
  const goalsState: GoalsState = {
    ...defaultState.goalsState,
    goalTypeSuggestions,
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
