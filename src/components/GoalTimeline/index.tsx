import { ReactElement } from "react";

import GoalTimeline from "components/GoalTimeline/GoalTimeline";
import {
  asyncAddGoal,
  asyncGetUserEdits,
  loadUserEdits,
} from "components/GoalTimeline/Redux/GoalActions";
import { StoreState } from "types";
import { Goal } from "types/goals";
import { useAppDispatch, useAppSelector } from "types/hooks";

export default function (): ReactElement {
  const dispatch = useAppDispatch();

  const currentProjectId = useAppSelector(
    (state: StoreState) => state.currentProjectState.project.id
  );
  const goalState = useAppSelector((state: StoreState) => state.goalsState);

  const chooseGoal = (goal: Goal) => dispatch(asyncAddGoal(goal));
  const clearHistory = () => dispatch(loadUserEdits());
  const loadHistory = () => dispatch(asyncGetUserEdits());

  return (
    <GoalTimeline
      {...goalState}
      chooseGoal={chooseGoal}
      clearHistory={clearHistory}
      currentProjectId={currentProjectId}
      loadHistory={loadHistory}
    />
  );
}
