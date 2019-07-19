import { GoalProps, Goal, GoalType } from "../../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import DisplayProg from "./DisplayProg";
import AppBarComponent from "../../../components/AppBar/AppBarComponent";
import PageNotFound from "../../../components/PageNotFound/component";
import EmptyGoalComponent from "../../../components/EmptyGoal/EmptyGoalComponent";
import MergeDupStep from "../../MergeDupGoal/MergeDupStep";
import CharInventoryCreation from "../../CharInventoryCreation";

interface componentSteps {
  goal: GoalType;
  steps: JSX.Element[];
  loadComponent: () => JSX.Element;
}

const stepComponentDictionary: componentSteps[] = [
  {
    goal: GoalType.CreateCharInv,
    steps: [<CharInventoryCreation />],
    loadComponent: () => getGoal(GoalType.CreateCharInv)
  },
  {
    goal: GoalType.ValidateChars,
    steps: [],
    loadComponent: () => getGoal(GoalType.ValidateChars)
  },
  {
    goal: GoalType.CreateStrWordInv,
    steps: [],
    loadComponent: () => getGoal(GoalType.CreateStrWordInv)
  },
  {
    goal: GoalType.ValidateStrWords,
    steps: [],
    loadComponent: () => getGoal(GoalType.ValidateStrWords)
  },
  {
    goal: GoalType.MergeDups,
    steps: [<MergeDupStep />],
    loadComponent: () => getGoal(GoalType.MergeDups)
  },
  {
    goal: GoalType.SpellcheckGloss,
    steps: [],
    loadComponent: () => getGoal(GoalType.SpellcheckGloss)
  },
  {
    goal: GoalType.ViewFind,
    steps: [],
    loadComponent: () => getGoal(GoalType.ViewFind)
  },
  {
    goal: GoalType.HandleFlags,
    steps: [],
    loadComponent: () => getGoal(GoalType.HandleFlags)
  }
];

function getGoal(goalType: GoalType): JSX.Element {
  let steps: JSX.Element[] = stepComponentDictionary[goalType].steps;
  if (steps.length > 0) {
    return stepComponentDictionary[goalType].steps[0];
  }
  return <EmptyGoalComponent />;
}

class BaseGoalScreen extends React.Component<GoalProps & LocalizeContextProps> {
  renderGoal(goal: Goal): JSX.Element {
    return (
      <div className="GoalDisplay content">
        <AppBarComponent />
        <DisplayProg />
        {stepComponentDictionary[goal.goalType].loadComponent()}
      </div>
    );
  }

  render() {
    return (
      <div className={"GoalDisplay"}>
        {this.props.goal ? this.renderGoal(this.props.goal) : <PageNotFound />}
      </div>
    );
  }
}

export default withLocalize(BaseGoalScreen);
