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
}

const stepComponentDictionary: componentSteps[] = [
  {
    goal: GoalType.CreateCharInv,
    steps: [<CharInventoryCreation />]
  },
  {
    goal: GoalType.ValidateChars,
    steps: []
  },
  {
    goal: GoalType.CreateStrWordInv,
    steps: []
  },
  {
    goal: GoalType.ValidateStrWords,
    steps: []
  },
  {
    goal: GoalType.MergeDups,
    steps: [<MergeDupStep />]
  },
  {
    goal: GoalType.SpellcheckGloss,
    steps: []
  },
  {
    goal: GoalType.ViewFind,
    steps: []
  },
  {
    goal: GoalType.HandleFlags,
    steps: []
  }
];

class BaseGoalScreen extends React.Component<GoalProps & LocalizeContextProps> {
  renderGoal(goal: Goal): JSX.Element {
    return (
      <div className="GoalDisplay content">
        <AppBarComponent />
        <DisplayProg />
        {this.displayComponent(goal)}
      </div>
    );
  }

  displayComponent(goal: Goal): JSX.Element {
    let steps: JSX.Element[] = stepComponentDictionary[goal.goalType].steps;
    if (steps.length > 0) {
      return stepComponentDictionary[goal.goalType].steps[0];
    }
    return <EmptyGoalComponent />;
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
