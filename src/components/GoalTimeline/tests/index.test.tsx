import { Button } from "@mui/material";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import createMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { Permission } from "api/models";
import GoalTimeline, { createSuggestionData } from "components/GoalTimeline";
import { defaultState } from "components/GoalTimeline/DefaultState";
import { Goal, GoalType, GoalsState } from "types/goals";
import { goalTypeToGoal } from "utilities/goalUtilities";

jest.mock("backend", () => ({
  getCurrentPermissions: () => mockGetCurrentPermissions(),
  getGraylistEntries: (maxLists: number) => mockGetGraylistEntries(maxLists),
}));
jest.mock("components/GoalTimeline/Redux/GoalActions", () => ({
  asyncAddGoal: (goal: Goal) => mockChooseGoal(goal),
  asyncGetUserEdits: () => jest.fn(),
}));
jest.mock("components/Project/ProjectActions", () => ({}));
jest.mock("components/Pronunciations/Recorder");
jest.mock("types/hooks", () => {
  return {
    ...jest.requireActual("types/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const mockChooseGoal = jest.fn();
const mockGetCurrentPermissions = jest.fn();
const mockGetGraylistEntries = jest.fn();
const mockProjectId = "mockId";
const mockProjectRoles: { [key: string]: string } = {};
mockProjectRoles[mockProjectId] = "nonempty";

const allGoals = defaultState.allGoalTypes.map((t) => goalTypeToGoal(t));
const goalWithAnyGuid = (g: Goal): Goal => ({ ...g, guid: expect.any(String) });
const allGoalsWithAnyGuids = allGoals.map(goalWithAnyGuid);

let timeLord: renderer.ReactTestRenderer;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentPermissions.mockResolvedValue([
    Permission.CharacterInventory,
    Permission.MergeAndReviewEntries,
  ]);
  mockGetGraylistEntries.mockResolvedValue([]);
});

describe("GoalTimeline", () => {
  it("has the expected number of buttons", async () => {
    await renderTimeline(defaultState.allGoalTypes, allGoals);
    const buttons = timeLord.root.findAllByType(Button);
    expect(buttons).toHaveLength(
      defaultState.allGoalTypes.length + allGoals.length
    );
  });

  it("has one more button if there's a graylist entry", async () => {
    mockGetGraylistEntries.mockResolvedValue([
      [{ id: "word1" }, { id: "word2" }],
    ]);
    await renderTimeline(defaultState.allGoalTypes, allGoals);
    const buttons = timeLord.root.findAllByType(Button);
    expect(buttons).toHaveLength(
      defaultState.allGoalTypes.length + allGoals.length + 1
    );
  });

  it("selects a goal from suggestions", async () => {
    const goalNumber = 2;
    await renderTimeline();
    const goalButton = timeLord.root.findByProps({
      id: `new-goal-${allGoals[goalNumber].name}`,
    });
    await renderer.act(async () => goalButton.props.onClick());
    expect(mockChooseGoal).toHaveBeenCalledTimes(1);
    expect(mockChooseGoal.mock.calls[0][0].goalType).toEqual(
      defaultState.allGoalTypes[goalNumber]
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
  const currentProjectState = { project: { id: mockProjectId } };
  const goalsState: GoalsState = {
    ...defaultState,
    goalTypeSuggestions: goalTypeSuggestions ?? defaultState.allGoalTypes,
    history: history ?? [],
    previousGoalType: GoalType.Default,
  };
  await renderer.act(async () => {
    timeLord = renderer.create(
      <Provider store={createMockStore()({ currentProjectState, goalsState })}>
        <GoalTimeline />
      </Provider>
    );
  });
}
