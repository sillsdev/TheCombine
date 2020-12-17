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
export function BaseGoalScreen(props: GoalProps) {
  function displayComponent(goal: Goal) {
    const steps = stepComponent(goal.goalType);
    if (steps.length) {
      return steps[0];
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
