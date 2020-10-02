import React, { ReactElement } from "react";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import GoalTimelineVertical, {
  GoalTimelineVertical as GTVertical,
} from "../GoalTimelineVertical";
import { defaultState } from "../../DefaultState";
import { Goal } from "../../../../types/goals";

// Mock out HTMLDiv.scrollIntoView function, as it fails in a testing environment
HTMLDivElement.prototype.scrollIntoView = jest.fn();
jest.mock("../../../AppBar/AppBarComponent", () => "div");

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
let timeHandle: GTVertical;

beforeAll(() => {
  createTimeMaster();
});

beforeEach(() => {
  LOAD_EDITS.mockClear();
  CHOOSE_GOAL.mockClear();
});

describe("GoalTimelineVertical", () => {
  describe("findGoalByName", () => {
    it("Finds a goal by name when prompted", () => {
      expect(timeHandle.findGoalByName(goals, goals[2].name)).toEqual(goals[2]);
    });

    it("Returns undefined when prompted for a non-existant goal", () => {
      expect(timeHandle.findGoalByName(goals.slice(1), goals[0].name)).toBe(
        undefined
      );
    });
  });

  describe("handleChange", () => {
    it("Selects a goal from suggestions based on name", () => {
      timeHandle.handleChange(goals[2].name);
      expect(CHOOSE_GOAL).toHaveBeenCalledWith(goals[2]);
    });

    it("Doesn't select a non-existent goal by name", () => {
      timeHandle.handleChange("The goal is a lie");
      expect(CHOOSE_GOAL).toHaveBeenCalledTimes(0);
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
  timeHandle = timeMaster.root.findByType(GTVertical).instance;
}

function createTimeline(history?: Goal[], suggestions?: Goal[]): ReactElement {
  return (
    <GoalTimelineVertical
      chooseGoal={CHOOSE_GOAL}
      loadHistory={LOAD_HISTORY}
      allPossibleGoals={goals}
      history={history ? history : goals.slice(0, 3)}
      suggestions={suggestions ? suggestions : goals.slice(0, 3)}
    />
  );
}
