import React, { ReactElement } from "react";
import ReactDOM from "react-dom";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";

import GoalTimelineHorizontal, {
  GoalTimelineHorizontal as GTHorizontal,
} from "../GoalTimelineHorizontal";
import { defaultState } from "../../DefaultState";
import { Goal } from "../../../../types/goals";

// Mock store
const STATE = {
  goalsState: {
    historyState: {
      history: [...defaultState.allPossibleGoals],
    },
    suggestionsState: {
      suggestions: [...defaultState.allPossibleGoals],
    },
  },
};
const mockStore = configureMockStore([])(STATE);

// Mock out HTMLDiv.scrollIntoView function, as it fails in a testing environment
HTMLDivElement.prototype.scrollIntoView = jest.fn();
jest.mock("../../../AppBar/AppBarComponent", () => "div");

// Constants
const LOAD_EDITS = jest.fn();
const CHOOSE_GOAL = jest.fn();
const LOAD_HISTORY = jest.fn();
const goals: Goal[] = [...defaultState.allPossibleGoals];

// Handles
var timeMaster: ReactTestRenderer;
var timeHandle: GTHorizontal;

beforeAll(() => {
  createTimeMaster();
});

beforeEach(() => {
  LOAD_EDITS.mockClear();
  CHOOSE_GOAL.mockClear();
});

describe("Test GoalTimelineHorizontal", () => {
  // render
  it("Renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>{createTimeline()}</Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  // findGoalByName
  it("Finds a goal by name when prompted", () => {
    expect(timeHandle.findGoalByName(goals, goals[2].name)).toEqual(goals[2]);
  });

  it("Returns undefined when prompted for a non-existant goal", () => {
    expect(timeHandle.findGoalByName(goals.slice(1), goals[0].name)).toBe(
      undefined
    );
  });

  // handleChange
  it("Selects a goal from suggestions based on name", () => {
    timeHandle.handleChange(goals[2].name);
    expect(CHOOSE_GOAL).toHaveBeenCalledWith(goals[2]);
  });

  it("Doesn't select a non-existant goal by name", () => {
    timeHandle.handleChange("The goal is a lie");
    expect(CHOOSE_GOAL).toHaveBeenCalledTimes(0);
  });

  // createSuggestionData
  it("Generates proper suggestion data: no options to append", () => {
    createTimeMaster([], goals);
    expect(timeHandle.createSuggestionData()).toEqual(goals.slice(1));

    // Cleanup
    createTimeMaster();
  });

  it("Generates proper suggestion data: append options", () => {
    let tmp = [...goals.slice(3), ...goals.slice(0, 2)];
    createTimeMaster([], goals.slice(2));
    expect(timeHandle.createSuggestionData()).toEqual(tmp);

    // Cleanup
    createTimeMaster();
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
  timeHandle = timeMaster.root.findByType(GTHorizontal).instance;
}

function createTimeline(history?: Goal[], suggestions?: Goal[]): ReactElement {
  return (
    <GoalTimelineHorizontal
      chooseGoal={CHOOSE_GOAL}
      loadHistory={LOAD_HISTORY}
      allPossibleGoals={goals}
      history={history ? history : goals.slice(0, 3)}
      suggestions={suggestions ? suggestions : goals.slice(3)}
    />
  );
}
