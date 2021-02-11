import { ReactElement } from "react";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Goal } from "types/goals";
import { defaultState } from "components/GoalTimeline/DefaultState";
import GoalTimeline from "components/GoalTimeline/GoalTimelineComponent";

// Mock out HTMLDiv.scrollIntoView function, as it fails in a testing environment
HTMLDivElement.prototype.scrollIntoView = jest.fn();
jest.mock("components/AppBar/AppBarComponent", () => "div");

// Constants
const LOAD_EDITS = jest.fn();
const CHOOSE_GOAL = jest.fn();
const LOAD_HISTORY = jest.fn();
const goals = [...defaultState.allPossibleGoals];

// Mock store
const STATE = {
  goalsState: {
    historyState: { history: [...goals] },
    suggestionsState: { suggestions: [...goals] },
  },
};
const mockStore = configureMockStore([])(STATE);

// Handles
let timeMaster: ReactTestRenderer;
let timeHandle: GoalTimeline;

beforeAll(() => {
  createTimeMaster();
});

beforeEach(() => {
  LOAD_EDITS.mockClear();
  CHOOSE_GOAL.mockClear();
});

describe("GoalTimelineVertical", () => {
  describe("handleChange", () => {
    it("Selects a goal from suggestions", () => {
      timeHandle.handleChange(goals[2].goalType);
      expect(CHOOSE_GOAL).toBeCalled();
      expect(CHOOSE_GOAL.mock.calls[0][0].goalType).toEqual(goals[2].goalType);
    });

    it("Defaults to generic GoalType.Default=-1 for a non-existent goalType", () => {
      timeHandle.handleChange(-2);
      expect(CHOOSE_GOAL).toBeCalled();
      expect(CHOOSE_GOAL.mock.calls[0][0].goalType).toEqual(-1);
    });
  });

  describe("createSuggestionData", () => {
    it("Generates proper suggestion data: no options to append", () => {
      createTimeMaster([], goals);
      expect(timeHandle.createSuggestionData()).toEqual(goals.slice(1));

      // Cleanup
      createTimeMaster();
    });

    it("Generates proper suggestion data: append options", () => {
      const tmp = [...goals.slice(3), ...goals.slice(0, 2)];
      createTimeMaster([], goals.slice(2));
      expect(timeHandle.createSuggestionData()).toEqual(tmp);

      // Cleanup
      createTimeMaster();
    });

    it("Generates proper suggestion data: empty suggestion data", () => {
      createTimeMaster([], []);
      expect(timeHandle.createSuggestionData()).toEqual(goals);
    });
  });
});

function createTimeMaster(history?: Goal[], suggestions?: Goal[]): void {
  renderer.act(() => {
    timeMaster = renderer.create(
      <Provider store={mockStore}>
        {createTimeline(history, suggestions)}
      </Provider>
    );
  });
  timeHandle = timeMaster.root.findByType(GoalTimeline).instance;
}

function createTimeline(history?: Goal[], suggestions?: Goal[]): ReactElement {
  return (
    <GoalTimeline
      chooseGoal={CHOOSE_GOAL}
      loadHistory={LOAD_HISTORY}
      allPossibleGoals={goals}
      history={history ? history : goals.slice(0, 3)}
      suggestions={suggestions ? suggestions : goals.slice(0, 3)}
    />
  );
}
