import { GoalViewState } from "../../types/goals";
import { GoalView } from "./GoalView";
import { connect } from "react-redux";

export function mapStateToProps(state: GoalViewState) {
  return { ...state };
}

export default connect(mapStateToProps)(GoalView);
