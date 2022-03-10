import { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";

import history, { Path } from "browserHistory";
import { asyncAddGoal } from "components/GoalTimeline/Redux/GoalActions";
import PageNotFound from "components/PageNotFound/component";
import { MergeDupContinueDialog } from "goals/MergeDupGoal/MergeDupComponent/MergeDupContinueDialog";
import { StoreState } from "types";
import { GoalType } from "types/goals";
import { goalTypeToGoal } from "types/goalUtilities";

/**
 * Dialog for continuing to a new goal or returning to GoalTimeline.
 */
export default function NextGoalScreen(): ReactElement {
  const goal = useSelector((state: StoreState) => state.goalsState.currentGoal);

  const dispatch = useDispatch();
  function loadNextGoal(shouldContinue: boolean) {
    if (shouldContinue) {
      dispatch(asyncAddGoal(goalTypeToGoal(goal.goalType)));
    } else {
      history.push(Path.Goals);
    }
  }

  switch (goal.goalType) {
    case GoalType.MergeDups:
      return <MergeDupContinueDialog onSelection={loadNextGoal} />;
    default:
      return <PageNotFound />;
  }
}
