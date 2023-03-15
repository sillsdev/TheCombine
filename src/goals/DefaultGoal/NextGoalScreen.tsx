import { ReactElement } from "react";

import history, { Path } from "browserHistory";
import { asyncAddGoal } from "components/GoalTimeline/Redux/GoalActions";
import PageNotFound from "components/PageNotFound/component";
import { MergeDupContinueDialog } from "goals/MergeDupGoal/MergeDupComponent/MergeDupContinueDialog";
import { StoreState } from "types";
import { goalTypeToGoal } from "types/goalUtilities";
import { GoalType } from "types/goals";
import { useAppDispatch, useAppSelector } from "types/hooks";

/**
 * Dialog for continuing to a new goal or returning to GoalTimeline.
 */
export default function NextGoalScreen(): ReactElement {
  const goalType = useAppSelector(
    (state: StoreState) => state.goalsState.previousGoalType
  );

  const dispatch = useAppDispatch();
  function loadNextGoal(shouldContinue: boolean): void {
    if (shouldContinue) {
      dispatch(asyncAddGoal(goalTypeToGoal(goalType)));
    } else {
      history.push(Path.Goals);
    }
  }

  switch (goalType) {
    case GoalType.MergeDups:
      return <MergeDupContinueDialog onSelection={loadNextGoal} />;
    default:
      return <PageNotFound />;
  }
}
