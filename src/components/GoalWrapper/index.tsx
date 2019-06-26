import { StoreState } from "../../types";
import { Goal } from "../../types/goals";
import { GoalWrapperProps, GoalWrapper } from "./component";
import { CreateCharInv } from "../../goals/CreateCharInv/CreateCharInv";
import { connect } from "react-redux";

export function mapStateToProps(state: StoreState): GoalWrapperProps {
  return {
    goal: getGoalById(
      state.goalsState.allPossibleGoals,
      state.navState.VisibleComponentId
    )
  };
}

// Find the goal referenced by navState.VisibleComponentId and create a
// React component to contain it
export function getGoalById(goalOptions: Goal[], componentId: string): Goal {
  for (var goal of goalOptions) {
    if (goal.id === componentId) {
      return goal;
    }
  }
  return new CreateCharInv([]);
}

export default connect(mapStateToProps)(GoalWrapper);
