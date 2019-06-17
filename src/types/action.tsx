import { Action } from "redux";
import { Goal } from "./goals";
import { CreateCharInv } from "../goals/CreateCharInv/CreateCharInv";

export interface ActionWithPayload<T> extends Action {
  payload: T;
}

const MOCK_TYPE = "MOCK_TYPE";
type MOCK_TYPE = typeof MOCK_TYPE;

interface MockAction extends ActionWithPayload<Goal> {
  type: MOCK_TYPE;
  payload: Goal;
}

const goal: Goal = new CreateCharInv([]);

// Used for passing a non-existent action to a reducer
export const MockActionInstance: MockAction = {
  type: MOCK_TYPE,
  payload: goal
};
