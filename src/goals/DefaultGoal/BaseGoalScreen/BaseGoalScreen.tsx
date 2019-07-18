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
    loadComponent: () => <CharInventoryCreation />
  },
  {
    goal: GoalType.ValidateChars,
    steps: [],
    loadComponent: () => <EmptyGoalComponent />
  },
  {
    goal: GoalType.CreateStrWordInv,
    steps: [],
    loadComponent: () => <EmptyGoalComponent />
  },
  {
    goal: GoalType.ValidateStrWords,
    steps: [],
    loadComponent: () => <EmptyGoalComponent />
  },
  {
    goal: GoalType.MergeDups,
    steps: [<MergeDupStep />],
    loadComponent: () => <MergeDupStep />
  },
  {
    goal: GoalType.SpellcheckGloss,
    steps: [],
    loadComponent: () => <EmptyGoalComponent />
  },
  {
    goal: GoalType.ViewFind,
    steps: [],
    loadComponent: () => <EmptyGoalComponent />
  },
  {
    goal: GoalType.HandleFlags,
    steps: [],
    loadComponent: () => <EmptyGoalComponent />
  }
];

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
