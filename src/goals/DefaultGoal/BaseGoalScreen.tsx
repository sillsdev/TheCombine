import loadable from "@loadable/component";
import { ReactElement, useEffect } from "react";

import PageNotFound from "components/PageNotFound/component";
import DisplayProgress from "goals/DefaultGoal/DisplayProgress";
import Loading from "goals/DefaultGoal/Loading";
import { clearTree } from "goals/MergeDuplicates/Redux/MergeDupsActions";
import { setCurrentGoal } from "goals/Redux/GoalActions";
import { resetReviewEntries } from "goals/ReviewEntries/Redux/ReviewEntriesActions";
import { StoreState } from "types";
import { Goal, GoalStatus, GoalType } from "types/goals";
import { useAppDispatch, useAppSelector } from "types/hooks";

const CharacterInventory = loadable(() => import("goals/CharacterInventory"));
const MergeDup = loadable(() => import("goals/MergeDuplicates"));
const ReviewDeferredDups = loadable(
  () => import("goals/ReviewDeferredDuplicates")
);
const ReviewEntries = loadable(() => import("goals/ReviewEntries"));

function displayComponent(goal: Goal): ReactElement {
  const isCompleted = goal.status === GoalStatus.Completed;
  switch (goal.goalType) {
    case GoalType.CreateCharInv:
      return <CharacterInventory completed={isCompleted} />;
    case GoalType.MergeDups:
      return <MergeDup completed={isCompleted} />;
    case GoalType.ReviewDeferredDups:
      return <ReviewDeferredDups completed={isCompleted} />;
    case GoalType.ReviewEntries:
      return <ReviewEntries completed={isCompleted} />;
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
      dispatch(resetReviewEntries());
      dispatch(clearTree());
    };
  }, [dispatch]);

  return (
    <>
      {goal.status !== GoalStatus.Completed && <DisplayProgress />}
      {displayComponent(goal)}
    </>
  );
}
