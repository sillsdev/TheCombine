import { Action } from "redux";
import { Goal } from "./goals";
import { CreateCharInv } from "../goals/CreateCharInv/CreateCharInv";
import { MergeDups } from "../goals/MergeDupGoal/MergeDups";

export interface ActionWithPayload<T> extends Action {
  payload: T;
}

const MOCK_TYPE = "MOCK_TYPE";
type MOCK_TYPE = typeof MOCK_TYPE;

interface MockAction extends ActionWithPayload<Goal> {
  type: MOCK_TYPE;
  payload: Goal;
}

interface MockActionGoalArray extends ActionWithPayload<Goal[]> {
  type: MOCK_TYPE;
  payload: Goal[];
}

const goal: Goal = new CreateCharInv();
const goalArray: Goal[] = [new CreateCharInv(), new MergeDups()];

// Used for passing a non-existent action to a reducer
export const MockActionInstance: MockAction = {
  type: MOCK_TYPE,
  payload: goal
};

export const MockActionGoalArrayInstance: MockActionGoalArray = {
  type: MOCK_TYPE,
  payload: goalArray
};
