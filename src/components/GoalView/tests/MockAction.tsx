import { Goal } from "../../../types/goals";
import { ActionWithPayload } from "../../../types/action";

export const MOCK_GOAL = "MOCK_GOAL";
export type MOCK_GOAL = typeof MOCK_GOAL;

export interface MockGoal extends ActionWithPayload<Goal> {
  type: MOCK_GOAL;
  payload: Goal;
}

export type MockGoalAction = MockGoal;
