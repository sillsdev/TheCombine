import React, { ReactNode } from "react";

import PageNotFound from "../../../components/PageNotFound/component";
import EmptyGoalComponent from "../../../components/EmptyGoal/EmptyGoalComponent";
import { Goal, GoalProps, GoalType } from "../../../types/goals";
import CharInventoryCreation from "../../CharInventoryCreation";
import MergeDupStep from "../../MergeDupGoal/MergeDupStep";
import ReviewEntriesComponent from "../../ReviewEntries/ReviewEntriesComponent";
import DisplayProg from "./DisplayProg";

interface componentSteps {
  goal: GoalType;
  steps: ReactNode[];
}

// WARNING: The order here must match the GoalType index.
const stepComponentDictionary: componentSteps[] = [
  { goal: GoalType.Default, steps: [] },
  {
    goal: GoalType.CreateCharInv,
    steps: [<CharInventoryCreation />],
  },
  { goal: GoalType.CreateStrWordInv, steps: [] },
  { goal: GoalType.HandleFlags, steps: [] },
  {
    goal: GoalType.MergeDups,
    steps: [<MergeDupStep />],
  },
  {
    goal: GoalType.ReviewEntries,
    steps: [<ReviewEntriesComponent />],
  },
  { goal: GoalType.SpellcheckGloss, steps: [] },
  { goal: GoalType.ValidateChars, steps: [] },
  { goal: GoalType.ValidateStrWords, steps: [] },
];

/**
 * Decides which component should be rendered for a goal,
 * based on the current step in the goal
 */
export default class BaseGoalScreen extends React.Component<GoalProps> {
  displayComponent(goal: Goal) {
    const stepComponent = stepComponentDictionary[goal.goalType];
    if (stepComponent.goal !== goal.goalType) {
      throw Error(
        "The stepComponentDictionary is out of sync with the GoalType indices."
      );
    }
    if (stepComponent.steps.length) {
      return stepComponent.steps[0];
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
