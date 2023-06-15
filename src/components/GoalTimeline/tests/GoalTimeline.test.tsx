import { Button } from "@mui/material";
import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import { Permission } from "api/models";
import GoalTimeline, {
  createSuggestionData,
} from "components/GoalTimeline/GoalTimeline";
import { defaultState } from "components/GoalTimeline/GoalTimelineTypes";
import { Goal, GoalType, GoalsState } from "types/goals";
import { goalTypeToGoal } from "utilities/goalUtilities";

// Mock out HTMLDiv.scrollIntoView function, as it fails in a testing environment
HTMLDivElement.prototype.scrollIntoView = jest.fn();

jest.mock("backend", () => ({
  getUserRole: () => ({ permissions: mockPermissions }),
}));
jest.mock("backend/localStorage", () => ({
  getCurrentUser: () => {
    const projectRoles: { [key: string]: string } = {};
    projectRoles[mockProjectId] = "nonempty";
    return { projectRoles };
  },
}));
jest.mock("components/AppBar/AppBarComponent", () => "div");

const mockPermissions = Object.values(Permission);
const mockProjectId = "mockId";

// Constants
const mockChooseGoal = jest.fn();
const mockClearHistory = jest.fn();
const mockLoadHistory = jest.fn();
const allGoals = defaultState.allGoalTypes.map((t) => goalTypeToGoal(t));
const allGoalsWithAnyGuids: Goal[] = allGoals.map((g) => ({
  ...g,
  guid: expect.any(String),
}));

let timeLord: renderer.ReactTestRenderer;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GoalTimeline", () => {
  it("Has the expected number of buttons", async () => {
    await renderTimeline(defaultState.allGoalTypes, allGoals);
    const buttons = timeLord.root.findAllByType(Button);
    expect(buttons).toHaveLength(
      defaultState.allGoalTypes.length + allGoals.length
    );
  });

  it("Selects a goal from suggestions", async () => {
    const goalNumber = 2;
    await renderTimeline();
    const goalButton = timeLord.root.findByProps({
      id: `new-goal-${allGoals[goalNumber].name}`,
    });
    await renderer.act(async () => goalButton.props.onClick());
    expect(mockChooseGoal).toBeCalledTimes(1);
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
  const mockState: GoalsState = {
    ...defaultState,
    goalTypeSuggestions: goalTypeSuggestions ?? defaultState.allGoalTypes,
    history: history ?? [],
    previousGoalType: GoalType.Default,
  };
  await renderer.act(async () => {
    timeLord = renderer.create(
      <GoalTimeline
        {...mockState}
        chooseGoal={mockChooseGoal}
        clearHistory={mockClearHistory}
        loadHistory={mockLoadHistory}
        currentProjectId={mockProjectId}
      />
    );
  });
}
