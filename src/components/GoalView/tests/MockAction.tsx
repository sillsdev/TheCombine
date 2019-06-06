import { Goals } from "../../../types/goals";
import { ActionWithPayload } from "../GoalViewActions";

export const MOCK_GOAL = "MOCK_GOAL";
export type MOCK_GOAL = typeof MOCK_GOAL;

export interface MockGoal extends ActionWithPayload<Goals> {
  type: MOCK_GOAL;
  payload: Goals;
}

export type MockGoalAction = MockGoal;
