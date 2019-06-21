import { Goal } from "../../../types/goals";
import * as timelineActions from "../GoalTimelineActions";
import * as navActions from "../../Navigation/NavigationActions";
import { Dispatch } from "redux";

export type ChooseGoal = timelineActions.AddGoal | navActions.NavigationAction;

export function chooseGoal(goal: Goal) {
  return (dispatch: Dispatch<ChooseGoal>) => {
    goal.id = Math.floor(Math.random() * 100000 + 1).toString();
    dispatch(navActions.navigateForward(goal));
    dispatch(timelineActions.addGoalToHistory(goal));
  };
}
