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
  if (goal) {
    let relevantURL = getRelevantURL(ownProps.match.url);
    goal = isGoalCorrectType(goal, relevantURL) ? goal : undefined;
  }
  return {
    goal: goal
  };
}

// Find a goal by id. Return the goal if it exists.
function findGoalById(id: string, goalHistory: Goal[]): Goal | undefined {
  for (var goal of goalHistory) {
    if (goal.id === id) {
      return goal;
    }
  }
}

function getRelevantURL(url: string): string {
  let urlWithRemovedParameters = url.replace(/[0-9]/g, "");
  return urlWithRemovedParameters.slice(
    urlWithRemovedParameters.lastIndexOf("/") + 1
  );
}

function isGoalCorrectType(goal: Goal, expectedType: string): boolean {
  return goal.name === expectedType;
}

export default connect(mapStateToProps)(BaseGoalScreen);
