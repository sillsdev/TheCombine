import loadable from "@loadable/component";
import React from "react";
import { useSelector } from "react-redux";

import PageNotFound from "components/PageNotFound/component";
import DisplayProgress from "goals/DefaultGoal/DisplayProgress";
import { StoreState } from "types";
import { Goal, GoalType } from "types/goals";

const CharInv = loadable(
  () => import("goals/CreateCharInv/CharInvComponent/CharInv")
);
const MergeDupStep = loadable(() => import("goals/MergeDupGoal/MergeDupStep"));
const ReviewEntriesComponent = loadable(
  () => import("goals/ReviewEntries/ReviewEntriesComponent")
);

function displayComponent(goal: Goal) {
  switch (goal.goalType) {
    case GoalType.CreateCharInv:
      return <CharInv completed={goal.completed} />;
    case GoalType.MergeDups:
      return <MergeDupStep />;
    case GoalType.ReviewEntries:
      return <ReviewEntriesComponent />;
    default:
      return <PageNotFound />;
  }
}

/**
 * Decides which component should be rendered for a goal.
 */
export default function BaseGoalScreen() {
  const goal = useSelector((state: StoreState) => state.goalsState.currentGoal);
  return (
    <React.Fragment>
      <DisplayProgress />
      {displayComponent(goal)}
    </React.Fragment>
  );
}
