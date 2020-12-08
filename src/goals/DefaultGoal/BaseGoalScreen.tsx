import React, { ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";

import PageNotFound from "../../components/PageNotFound/component";
import EmptyGoalComponent from "../../components/EmptyGoal/EmptyGoalComponent";
import { StoreState } from "../../types";
import { Goal, GoalProps, GoalType } from "../../types/goals";
import CharInventoryCreation from "../CharInventoryCreation";
import MergeDupStep from "../MergeDupGoal/MergeDupStep";
import ReviewEntriesComponent from "../ReviewEntries/ReviewEntriesComponent";
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
export function BaseGoalScreen(props: GoalProps) {
  function displayComponent(goal: Goal) {
    let steps: ReactNode[] = stepComponentDictionary[goal.goalType].steps;
    if (steps.length > 0) {
      return stepComponentDictionary[goal.goalType].steps[0];
    }
    return <EmptyGoalComponent />;
  }

  function renderGoal(goal: Goal) {
    return (
      <React.Fragment>
        <DisplayProg />
        {displayComponent(goal)}
      </React.Fragment>
    );
  }

  return props.goal ? renderGoal(props.goal) : <PageNotFound />;
}

export interface TParams {
  id: string;
}

export default function (props: RouteComponentProps<TParams>) {
  const idNumber = parseInt(props.match.params.id);
  const history = useSelector(
    (state: StoreState) => state.goalsState.historyState.history
  );
  const [goal, setGoal] = useState<Goal | undefined>();

  useEffect(() => {
    if (!Number.isNaN(idNumber)) {
      setGoal(history[idNumber]);
    }
  }, [idNumber, history]);

  return <BaseGoalScreen goal={goal} />;
}
