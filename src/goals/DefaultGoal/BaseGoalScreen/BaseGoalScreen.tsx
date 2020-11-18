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

const stepComponentDictionary: componentSteps[] = [
  {
    goal: GoalType.CreateCharInv,
    steps: [<CharInventoryCreation />],
  },
  {
    goal: GoalType.ValidateChars,
    steps: [],
  },
  {
    goal: GoalType.CreateStrWordInv,
    steps: [],
  },
  {
    goal: GoalType.ValidateStrWords,
    steps: [],
  },
  {
    goal: GoalType.MergeDups,
    steps: [<MergeDupStep />],
  },
  {
    goal: GoalType.SpellcheckGloss,
    steps: [],
  },
  {
    goal: GoalType.ReviewEntries,
    steps: [<ReviewEntriesComponent />],
  },
  {
    goal: GoalType.HandleFlags,
    steps: [],
  },
];

/**
 * Decides which component should be rendered for a goal,
 * based on the current step in the goal
 */
export default class BaseGoalScreen extends React.Component<GoalProps> {
  renderGoal(goal: Goal): ReactNode {
    return (
      <React.Fragment>
        <DisplayProg />
        {this.displayComponent(goal)}
      </React.Fragment>
    );
  }

  displayComponent(goal: Goal): ReactNode {
    let steps: ReactNode[] = stepComponentDictionary[goal.goalType].steps;
    if (steps.length > 0) {
      return stepComponentDictionary[goal.goalType].steps[0];
    }
    return <EmptyGoalComponent />;
  }
  render() {
    return this.props.goal ? (
      this.renderGoal(this.props.goal)
    ) : (
      <PageNotFound />
    );
  }
}
