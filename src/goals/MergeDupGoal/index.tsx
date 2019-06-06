import { connect } from "react-redux";

import { StoreState } from "../../types";
import BaseGoalScreen from "../DefaultGoal/BaseGoalScreen";
import BaseGoalSelect from "../DefaultGoal/BaseGoalSelect";

//placeholder interfacees
export interface MergeDupData {}
export interface MergeDupStepProps {}

export function mapStateToProps(state: StoreState) {
  return {};
}

export const Selector = connect(mapStateToProps)(BaseGoalSelect);
export default connect(mapStateToProps)(BaseGoalScreen);
