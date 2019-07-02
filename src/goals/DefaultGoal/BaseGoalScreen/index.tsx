import { StoreState } from "../../../types";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { LocalizeContextProps } from "react-localize-redux";
import { Goal, GoalProps } from "../../../types/goals";
import BaseGoalScreen from "./BaseGoalScreen";

export interface TParams {
  id: string;
}

export function mapStateToProps(
  state: StoreState,
  ownProps: GoalProps & RouteComponentProps<TParams> & LocalizeContextProps
): GoalProps {
  let goal: Goal | undefined;
  goal = findGoalById(
    ownProps.match.params.id,
    state.goalsState.historyState.history
  );
  return {
    goal: goal
  };
}

// Find a goal by id. Return the goal if it exists.
function findGoalById(id: string, goalHistory: Goal[]): Goal | undefined {
  let idNumber: number = parseInt(id);
  return goalHistory[idNumber];
}

export default connect(mapStateToProps)(BaseGoalScreen);
