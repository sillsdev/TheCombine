<<<<<<< HEAD:src/goals/DefaultGoal/BaseGoalScreen/index.tsx
import { StoreState } from "../../../types";
import { Goal } from "../../../types/goals";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";
import { connect } from "react-redux";
import BaseGoalScreen from "./BaseGoalScreen";
import { GoalProps } from "../../../types/goals";

export function mapStateToProps(state: StoreState): GoalProps {
=======
import { StoreState } from "../../types";
import GoalWrapper, { GoalWrapperProps, TParams } from "./component";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router";
import { LocalizeContextProps } from "react-localize-redux";
import { Goal } from "../../types/goals";

export function mapStateToProps(
  state: StoreState,
  ownProps: GoalWrapperProps &
    RouteComponentProps<TParams> &
    LocalizeContextProps
): GoalWrapperProps {
  let goal;
  goal = findGoalById(
    ownProps.match.params.id,
    state.goalsState.allPossibleGoals
  );
>>>>>>> Allow parameters to be passed into a URL:src/components/GoalWrapper/index.tsx
  return {
    goal: goal
  };
}

// Find a goal by id. Return the goal if it exists.
function findGoalById(id: string, allPossibleGoals: Goal[]): Goal | undefined {
  for (var goal of allPossibleGoals) {
    if (goal.id === id) {
      return goal;
    }
  }
}

export default connect(mapStateToProps)(BaseGoalScreen);
