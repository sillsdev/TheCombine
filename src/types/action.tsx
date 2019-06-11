import { Action } from "redux";
import { Goal, BaseGoal } from "./goals";

export interface ActionWithPayload<T> extends Action {
  payload: T;
}

export const MOCK_TYPE = "MOCK_TYPE";
export type MOCK_TYPE = typeof MOCK_TYPE;

export interface MockAction extends ActionWithPayload<Goal> {
  type: MOCK_TYPE;
  payload: Goal;
}

const goal: Goal = new BaseGoal();

export const MockActionInstance: MockAction = {
  type: MOCK_TYPE,
  payload: goal
};

export type MockActionType = MockAction;
