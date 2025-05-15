import { ReactElement } from "react";
import { useNavigate } from "react-router";

import PageNotFound from "components/PageNotFound/component";
import MergeDupsContinueDialog from "goals/MergeDuplicates/MergeDupsContinueDialog";
import { asyncAddGoal } from "goals/Redux/GoalActions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { GoalType } from "types/goals";
import { Path } from "types/path";
import { goalTypeToGoal } from "utilities/goalUtilities";

/**
 * Dialog for continuing to a new goal or returning to GoalTimeline.
 */
export default function NextGoalScreen(): ReactElement {
  const goalType = useAppSelector(
    (state: StoreState) => state.goalsState.previousGoalType
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function loadNextGoal(shouldContinue: boolean): void {
    if (shouldContinue) {
      dispatch(asyncAddGoal(goalTypeToGoal(goalType)));
    } else {
      navigate(Path.Goals);
    }
  }

  switch (goalType) {
    case GoalType.MergeDups:
      return <MergeDupsContinueDialog onSelection={loadNextGoal} />;
    default:
      return <PageNotFound />;
  }
}
