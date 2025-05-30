import loadable from "@loadable/component";
import { type ReactElement, useEffect } from "react";
import { useNavigate } from "react-router";

import PageNotFound from "components/PageNotFound/component";
import DisplayProgress from "goals/DefaultGoal/DisplayProgress";
import Loading from "goals/DefaultGoal/Loading";
import { clearTree } from "goals/MergeDuplicates/Redux/MergeDupsActions";
import { setCurrentGoal } from "goals/Redux/GoalActions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { Goal, GoalStatus, GoalType } from "types/goals";
import { Path } from "types/path";

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
  const { goalType, status } = useAppSelector(
    (state: StoreState) => state.goalsState.currentGoal
  );
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent getting stuck on loading screen when user clicks the back button.
    if (goalType === GoalType.Default) {
      navigate(Path.Goals);
    }
  }, [goalType, navigate]);

  return status === GoalStatus.Loading ? <Loading /> : <BaseGoalScreen />;
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
