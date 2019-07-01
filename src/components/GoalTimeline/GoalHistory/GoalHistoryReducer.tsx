import { GoalHistoryState } from "../../../types/goals";
import { Goal } from "../../../types/goals";
import { ActionWithPayload } from "../../../types/action";
import { defaultState } from "./DefaultState";
import { LOAD_GOAL_HISTORY } from "./GoalHistoryActions";

export const goalHistoryReducer = (
  state: GoalHistoryState | undefined,
  action: ActionWithPayload<Goal[]>
): GoalHistoryState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case LOAD_GOAL_HISTORY: // Load the goal history from the database
      return {
        history: [...state.history, ...action.payload]
      };

    default:
      return state;
  }
};
