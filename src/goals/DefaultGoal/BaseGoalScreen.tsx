import loadable from "@loadable/component";
import React from "react";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router-dom";

import EmptyGoalComponent from "components/EmptyGoal/EmptyGoalComponent";
import PageNotFound from "components/PageNotFound/component";
import DisplayProgress from "goals/DefaultGoal/DisplayProgress";
import { StoreState } from "types";
import { Goal, GoalType } from "types/goals";

const CharInventoryCreation = loadable(
  () => import("goals/CharInventoryCreation")
);
const MergeDupStep = loadable(() => import("goals/MergeDupGoal/MergeDupStep"));
const ReviewEntriesComponent = loadable(
  () => import("goals/ReviewEntries/ReviewEntriesComponent")
);

function displayComponent(goal: Goal) {
  switch (goal.goalType) {
    case GoalType.CreateCharInv:
      return <CharInventoryCreation goal={goal} />;
    case GoalType.MergeDups:
      return <MergeDupStep />;
    case GoalType.ReviewEntries:
      return <ReviewEntriesComponent />;
    default:
      return <EmptyGoalComponent />;
  }
}

export interface TParams {
  id: string;
}

/**
 * Decides which component should be rendered for a goal.
 */
export default function BaseGoalScreen(props: RouteComponentProps<TParams>) {
  const goalHistory = useSelector(
    (state: StoreState) => state.goalsState.historyState.history
  );
  const goalIndex = parseInt(props.match.params.id);
  const goal = goalHistory[goalIndex];

  return goal ? (
    <React.Fragment>
      <DisplayProgress />
      {displayComponent(goal)}
    </React.Fragment>
  ) : (
    <PageNotFound />
  );
}
