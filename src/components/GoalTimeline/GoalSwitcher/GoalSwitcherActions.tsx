import { Goal } from "../../../types/goals";
import * as timelineActions from "../GoalTimelineActions";
import * as navActions from "../../Navigation/NavigationActions";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../types";

export type ChooseGoal =
  | timelineActions.AddGoalToHistory
  | navActions.NavigationAction;

// export function chooseGoal(goal: Goal) {
//   return (dispatch: ThunkDispatch<StoreState, any, ChooseGoal>) => {
//     // goal.id = Math.floor(Math.random() * 100000 + 1).toString();
//     // dispatch(navActions.changeVisibleComponent(goal));
//     dispatch(timelineActions.asyncAddGoalToHistory(goal));
//   };
// }
