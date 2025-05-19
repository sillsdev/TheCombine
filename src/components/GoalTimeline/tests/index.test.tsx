import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import createMockStore from "redux-mock-store";

import { Permission } from "api/models";
import GoalTimeline, { createSuggestionData } from "components/GoalTimeline";
import { type GoalsState, defaultState } from "goals/Redux/GoalReduxTypes";
import { Goal, GoalType } from "types/goals";
import { goalTypeToGoal } from "utilities/goalUtilities";

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

const allGoals = defaultState.allGoalTypes.map((t) => goalTypeToGoal(t));
const goalWithAnyGuid = (g: Goal): Goal => ({ ...g, guid: expect.any(String) });
const allGoalsWithAnyGuids = allGoals.map(goalWithAnyGuid);

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
    await renderTimeline(defaultState.allGoalTypes, allGoals);
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(
      defaultState.allGoalTypes.length + allGoals.length
    );
  });

  it("has one more button if there's a graylist entry", async () => {
    mockHasGraylistEntries.mockResolvedValue(true);
    await renderTimeline(defaultState.allGoalTypes, allGoals);
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(
      defaultState.allGoalTypes.length + allGoals.length + 1
    );
  });

  it("selects a goal from suggestions", async () => {
    const goalNum = 2;
    await renderTimeline();
    await userEvent.click(screen.getByText(`${allGoals[goalNum].name}.title`));
    expect(mockChooseGoal).toHaveBeenCalledTimes(1);
    expect(mockChooseGoal.mock.calls[0][0].goalType).toEqual(
      defaultState.allGoalTypes[goalNum]
    );
  });

  describe("createSuggestionData", () => {
    it("don't suggests goal types that aren't available", () => {
      const suggestions = createSuggestionData([], defaultState.allGoalTypes);
      expect(suggestions).toEqual([]);
    });

    it("suggests all but the first of the available suggestions", () => {
      const suggestions = createSuggestionData(
        defaultState.allGoalTypes,
        defaultState.allGoalTypes
      );
      expect(suggestions).toEqual(allGoalsWithAnyGuids.slice(1));
    });

    it("appends non-suggested available goal types to the end", () => {
      const sliceIndex = 2;
      const suggestions = createSuggestionData(
        defaultState.allGoalTypes,
        defaultState.allGoalTypes.slice(sliceIndex)
      );
      const expectedGoals = [
        ...allGoalsWithAnyGuids.slice(sliceIndex + 1),
        ...allGoalsWithAnyGuids.slice(0, sliceIndex),
      ];
      expect(suggestions).toEqual(expectedGoals);
    });

    it("has a fallback for empty suggestion data", () => {
      const suggestions = createSuggestionData(defaultState.allGoalTypes, []);
      expect(suggestions).toEqual(allGoalsWithAnyGuids);
    });
  });
});

async function renderTimeline(
  goalTypeSuggestions?: GoalType[],
  history?: Goal[]
): Promise<void> {
  const currentProjectState = { project: { id: "mockProjId" } };
  const goalsState: GoalsState = {
    ...defaultState,
    goalTypeSuggestions: goalTypeSuggestions ?? defaultState.allGoalTypes,
    history: history ?? [],
    previousGoalType: GoalType.Default,
  };
  await act(async () => {
    render(
      <Provider store={createMockStore()({ currentProjectState, goalsState })}>
        <GoalTimeline />
      </Provider>
    );
  });
}
