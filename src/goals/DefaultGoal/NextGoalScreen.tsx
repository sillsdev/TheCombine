import { ReactElement } from "react";
import { useNavigate } from "react-router";

import PageNotFound from "components/PageNotFound/component";
import MergeDupsContinueDialog from "goals/MergeDuplicates/MergeDupsContinueDialog";
import { asyncAddGoal } from "goals/Redux/GoalActions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { GoalName } from "types/goals";
import { Path } from "types/path";
import { goalNameToGoal } from "utilities/goalUtilities";

/**
 * Dialog for continuing to a new goal or returning to GoalTimeline.
 */
export default function NextGoalScreen(): ReactElement {
  const prevGoal = useAppSelector(
    (state: StoreState) => state.goalsState.previousGoal
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function loadNextGoal(shouldContinue: boolean): void {
    if (shouldContinue) {
      dispatch(asyncAddGoal(goalNameToGoal(prevGoal)));
    } else {
      navigate(Path.Goals);
    }
  }

  switch (prevGoal) {
    case GoalName.MergeDups:
      return <MergeDupsContinueDialog onSelection={loadNextGoal} />;
    default:
      return <PageNotFound />;
  }
}
