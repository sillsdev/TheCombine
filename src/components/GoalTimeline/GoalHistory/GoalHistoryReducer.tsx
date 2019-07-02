import { ActionWithPayload } from "../../../types/action";
import { defaultState } from "./DefaultState";
import { GoalHistoryState, Goal } from "../../../types/goals";

export const goalHistoryReducer = (
  state: GoalHistoryState | undefined,
  action: ActionWithPayload<Goal[]>
): GoalHistoryState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    default:
      return state;
  }
};
