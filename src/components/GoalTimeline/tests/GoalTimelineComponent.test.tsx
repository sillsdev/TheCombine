import { ReactElement } from "react";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/GoalTimeline/DefaultState";
import GoalTimeline from "components/GoalTimeline/GoalTimelineComponent";
import { goalTypeToGoal } from "types/goalUtilities";
import { Goal, GoalType } from "types/goals";

// Mock out HTMLDiv.scrollIntoView function, as it fails in a testing environment
HTMLDivElement.prototype.scrollIntoView = jest.fn();
jest.mock("components/AppBar/AppBarComponent", () => "div");

// Constants
const CHOOSE_GOAL = jest.fn();
const CLEAR_HISTORY = jest.fn();
const LOAD_HISTORY = jest.fn();
const goals = defaultState.allGoalTypes.map((t) => goalTypeToGoal(t));
const goalsWithAnyGuids: Goal[] = goals.map((g) => ({
  ...g,
  guid: expect.any(String),
}));

// Mock store
const STATE = {
  goalsState: {
    goalTypeSuggestions: [...goals],
    history: [...goals],
  },
};
const mockStore = configureMockStore()(STATE);

// Handles
let timeMaster: ReactTestRenderer;
let timeHandle: GoalTimeline;

beforeAll(() => {
  createTimeMaster();
});

beforeEach(() => {
  CHOOSE_GOAL.mockClear();
});

describe("GoalTimelineVertical", () => {
  describe("handleChange", () => {
    it("Selects a goal from suggestions", () => {
      timeHandle.handleChange(goals[2]);
      expect(CHOOSE_GOAL).toBeCalled();
      expect(CHOOSE_GOAL.mock.calls[0][0].goalType).toEqual(goals[2].goalType);
    });
  });

  describe("createSuggestionData", () => {
    it("Generates proper suggestion data: no options to append", () => {
      createTimeMaster([], defaultState.allGoalTypes);
      expect(timeHandle.createSuggestionData()).toEqual(
        goalsWithAnyGuids.slice(1)
      );

      // Cleanup
      createTimeMaster();
    });

    it("Generates proper suggestion data: append options", () => {
      const expectedGoals = [
        ...goalsWithAnyGuids.slice(3),
        ...goalsWithAnyGuids.slice(0, 2),
      ];
      createTimeMaster([], defaultState.allGoalTypes.slice(2));
      expect(timeHandle.createSuggestionData()).toEqual(expectedGoals);

      // Cleanup
      createTimeMaster();
    });

    it("Generates proper suggestion data: empty suggestion data", () => {
      createTimeMaster([], []);
      expect(timeHandle.createSuggestionData()).toEqual(goalsWithAnyGuids);
    });
  });
});

function createTimeMaster(history?: Goal[], suggestions?: GoalType[]): void {
  renderer.act(() => {
    timeMaster = renderer.create(
      <Provider store={mockStore}>
        {createTimeline(history, suggestions)}
      </Provider>
    );
  });
  timeHandle = timeMaster.root.findByType(GoalTimeline).instance;
}

function createTimeline(
  history?: Goal[],
  suggestions?: GoalType[]
): ReactElement {
  return (
    <GoalTimeline
      chooseGoal={CHOOSE_GOAL}
      clearHistory={CLEAR_HISTORY}
      loadHistory={LOAD_HISTORY}
      allGoalTypes={defaultState.allGoalTypes}
      currentGoal={defaultState.currentGoal}
      goalTypeSuggestions={suggestions ?? defaultState.allGoalTypes.slice(0, 3)}
      history={history ?? goals.slice(0, 3)}
    />
  );
}
