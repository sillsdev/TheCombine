import * as actions from "../GoalTimelineActions";
import { Goal } from "../../../types/goals";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";
import { MergeDups } from "../../../goals/MergeDupGoal/MergeDups";

it("should create an action to add a goal", () => {
  const goal: Goal = new CreateCharInv([]);
  const expectedAction: actions.AddGoalToHistory = {
    type: actions.ADD_GOAL_TO_HISTORY,
    payload: [goal]
  };
  expect(actions.addGoalToHistory(goal)).toEqual(expectedAction);
});

it("should create an action to load user edits", () => {
  const goalHistory: Goal[] = [new CreateCharInv([]), new MergeDups([])];
  const expectedAction: actions.LoadUserEdits = {
    type: actions.LOAD_USER_EDITS,
    payload: goalHistory
  };
  expect(actions.loadUserEdits(goalHistory)).toEqual(expectedAction);
});
