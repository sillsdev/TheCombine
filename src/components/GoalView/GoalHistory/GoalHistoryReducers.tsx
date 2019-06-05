import Stack from "../../../types/stack";
import { Goals, GoalsState } from "../../../types/goals";
import { User } from "../../../types/user";
import {
  ADD_GOAL_TO_HISTORY,
  AddGoalToHistoryAction
} from "../GoalViewActions";
import { TempGoal } from "../../../goals/tempGoal";

// const testUser: User = {
//   name: "Chewbacca",
//   username: "WUUAHAHHHAAAAAAAAAA",
//   id: 1
// };

// const testUser2: User = {
//   name: "Skinner",
//   username: "Skinner",
//   id: 2
// };
// const testHistory: Goals[] = [];
// testHistory.push(new TempGoal(testUser));
// testHistory.push(new TempGoal(testUser2));

export const defaultState: GoalsState = {
  history: new Stack<Goals>([]),
  suggestions: new Stack<Goals>([])
};

export const goalHistoryReducer = (
  state: GoalsState | undefined,
  action: AddGoalToHistoryAction
): GoalsState => {
  if (!state) {
    return defaultState;
  }
  switch (action.type) {
    case ADD_GOAL_TO_HISTORY:
      return {
        history: state.history.push(action.payload),
        suggestions: state.suggestions
      };
    default:
      return state;
  }
};
