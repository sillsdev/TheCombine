import * as actions from "../GoalTimelineActions";
import { Goal } from "../../../types/goals";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";

it("should create an action to add a goal", () => {
  const goal: Goal = new CreateCharInv([]);
  const expectedAction: actions.AddGoal = {
    type: actions.ADD_GOAL,
    payload: goal
  };
  expect(actions.addGoalToHistory(goal)).toEqual(expectedAction);
});
