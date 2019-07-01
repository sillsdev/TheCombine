import * as actions from "../GoalHistoryActions";
import { CreateCharInv } from "../../../../goals/CreateCharInv/CreateCharInv";
import { Goal } from "../../../../types/goals";

it("should create an action to load the goal history", () => {
  let goalHistory: Goal[] = [new CreateCharInv([])];
  const expectedAction: actions.LoadGoalHistory = {
    type: actions.LOAD_GOAL_HISTORY,
    payload: goalHistory
  };
  expect(actions.loadGoalHistory(goalHistory)).toEqual(expectedAction);
});
