import { Goal } from "../../../types/goals";
import { ActionWithPayload } from "../../../types/action";

export const MOCK_ACTION_TYPE = "MOCK_ACTION_TYPE";
export type MOCK_ACTION_TYPE = typeof MOCK_ACTION_TYPE;

export interface MockAction extends ActionWithPayload<Goal> {
  type: MOCK_ACTION_TYPE;
  payload: Goal;
}

export type MockGoalAction = MockAction;
