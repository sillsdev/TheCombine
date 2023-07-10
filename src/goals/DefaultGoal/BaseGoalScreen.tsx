import loadable from "@loadable/component";
import React, { ReactElement, useEffect } from "react";

import { setCurrentGoal } from "components/GoalTimeline/Redux/GoalActions";
import PageNotFound from "components/PageNotFound/component";
import DisplayProgress from "goals/DefaultGoal/DisplayProgress";
import Loading from "goals/DefaultGoal/Loading";
import { clearTree } from "goals/MergeDupGoal/Redux/MergeDupActions";
import { clearReviewEntriesState } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesActions";
import { StoreState } from "types";
import { Goal, GoalStatus, GoalType } from "types/goals";
import { useAppDispatch, useAppSelector } from "types/hooks";

const CharacterInventory = loadable(() => import("goals/CharacterInventory"));
const MergeDup = loadable(() => import("goals/MergeDupGoal/MergeDupComponent"));
const ReviewEntriesComponent = loadable(
  () => import("goals/ReviewEntries/ReviewEntriesComponent")
);

function displayComponent(goal: Goal): ReactElement {
  const isCompleted = goal.status === GoalStatus.Completed;
  switch (goal.goalType) {
    case GoalType.CreateCharInv:
      return <CharacterInventory completed={isCompleted} />;
    case GoalType.MergeDups:
      return <MergeDup completed={isCompleted} />;
    case GoalType.ReviewEntries:
      return <ReviewEntriesComponent />;
    default:
      return <PageNotFound />;
  }
}

export default function LoadingGoalScreen(): ReactElement {
  const goalStatus = useAppSelector(
    (state: StoreState) => state.goalsState.currentGoal.status
  );
  return goalStatus === GoalStatus.Loading ? <Loading /> : <BaseGoalScreen />;
}

/**
 * Decides which component should be rendered for a goal.
 */
export function BaseGoalScreen(): ReactElement {
  const goal = useAppSelector(
    (state: StoreState) => state.goalsState.currentGoal
  );
  const dispatch = useAppDispatch();
  useEffect(() => {
    return function cleanup(): void {
      dispatch(setCurrentGoal());
      dispatch(clearReviewEntriesState());
      dispatch(clearTree());
    };
  }, [dispatch]);

  return (
    <React.Fragment>
      {goal.status !== GoalStatus.Completed && <DisplayProgress />}
      {displayComponent(goal)}
    </React.Fragment>
  );
}
