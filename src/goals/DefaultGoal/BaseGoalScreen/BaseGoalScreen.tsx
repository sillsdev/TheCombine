import loadable from "@loadable/component";
import React, { ReactNode } from "react";

import PageNotFound from "components/PageNotFound/component";
import EmptyGoalComponent from "components/EmptyGoal/EmptyGoalComponent";
import { Goal, GoalProps, GoalType } from "types/goals";
import DisplayProg from "goals/DefaultGoal/BaseGoalScreen/DisplayProg";

const CharInventoryCreation = loadable(
  () => import("goals/CharInventoryCreation")
);
const MergeDupStep = loadable(() => import("goals/MergeDupGoal/MergeDupStep"));
const ReviewEntriesComponent = loadable(
  () => import("goals/ReviewEntries/ReviewEntriesComponent")
);

function stepComponent(goalType: GoalType): ReactNode[] {
  switch (goalType) {
    case GoalType.CreateCharInv:
      return [<CharInventoryCreation />];
    case GoalType.MergeDups:
      return [<MergeDupStep />];
    case GoalType.ReviewEntries:
      return [<ReviewEntriesComponent />];
    default:
      return [];
  }
}

/**
 * Decides which component should be rendered for a goal,
 * based on the current step in the goal
 */
export default class BaseGoalScreen extends React.Component<GoalProps> {
  displayComponent(goal: Goal) {
    const steps = stepComponent(goal.goalType);
    if (steps.length) {
      return steps[0];
    }
    return <EmptyGoalComponent />;
  }

  renderGoal(goal: Goal) {
    return (
      <React.Fragment>
        <DisplayProg />
        {this.displayComponent(goal)}
      </React.Fragment>
    );
  }

  render() {
    return this.props.goal ? (
      this.renderGoal(this.props.goal)
    ) : (
      <PageNotFound />
    );
  }
}
