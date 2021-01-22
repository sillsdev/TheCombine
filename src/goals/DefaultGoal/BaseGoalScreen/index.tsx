import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { LocalizeContextProps } from "react-localize-redux";

import { StoreState } from "types";
import { Goal, GoalProps } from "types/goals";
import BaseGoalScreen from "goals/DefaultGoal/BaseGoalScreen/BaseGoalScreen";

export interface TParams {
  id: string;
}

export function mapStateToProps(
  state: StoreState,
  ownProps: GoalProps & RouteComponentProps<TParams> & LocalizeContextProps
): GoalProps {
  let idNumber: number = parseInt(ownProps.match.params.id);
  let goal: Goal | undefined;
  if (!Number.isNaN(idNumber)) {
    goal = state.goalsState.historyState.history[idNumber];
  }
  return {
    goal: goal,
  };
}

export default connect(mapStateToProps)(BaseGoalScreen);
