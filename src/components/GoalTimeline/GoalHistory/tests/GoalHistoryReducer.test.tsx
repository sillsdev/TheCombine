import * as actions from "../GoalHistoryActions";
import { goalHistoryReducer } from "../GoalHistoryReducer";
import { Goal, GoalHistoryState } from "../../../../types/goals";
import { CreateCharInv } from "../../../../goals/CreateCharInv/CreateCharInv";
import { MergeDups } from "../../../../goals/MergeDupGoal/MergeDups";
import { ViewFinal } from "../../../../goals/ViewFinal/ViewFinal";

it("Should return the default state", () => {
  const newState: GoalHistoryState = {
    history: []
  };

  let goalHistory: Goal[] = [];

  expect(
    goalHistoryReducer(undefined, actions.loadGoalHistory(goalHistory))
  ).toEqual(newState);
});

it("Should set the goal history to the provided payload", () => {
  const goalHistory: Goal[] = [new CreateCharInv([]), new MergeDups([])];

  let state: GoalHistoryState = {
    history: []
  };

  let loadGoalAction: actions.LoadGoalHistory = {
    type: actions.LOAD_GOAL_HISTORY,
    payload: goalHistory
  };

  let newState: GoalHistoryState = {
    history: goalHistory
  };

  expect(goalHistoryReducer(state, loadGoalAction)).toEqual(newState);
});

it("Should set the goal history to the provided payload", () => {
  const currentGoalHistory: Goal[] = [new ViewFinal([])];
  const goalHistory: Goal[] = [new CreateCharInv([]), new MergeDups([])];

  let state: GoalHistoryState = {
    history: currentGoalHistory
  };

  let loadGoalAction: actions.LoadGoalHistory = {
    type: actions.LOAD_GOAL_HISTORY,
    payload: goalHistory
  };

  let newState: GoalHistoryState = {
    history: [...currentGoalHistory, ...goalHistory]
  };

  expect(goalHistoryReducer(state, loadGoalAction)).toEqual(newState);
});
