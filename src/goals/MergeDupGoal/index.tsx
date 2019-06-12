import { connect } from "react-redux";

import { StoreState } from "../../types";
import BaseGoalSelect from "../DefaultGoal/BaseGoalSelect/BaseGoalSelect";
import BaseGoalScreen from "../DefaultGoal/BaseGoalScreen/BaseGoalScreen";

//placeholder interfacees
export interface MergeDupData {}
export interface MergeDupStepProps {}

export function mapStateToProps(state: StoreState) {
  return {};
}

export const Selector = connect(mapStateToProps)(BaseGoalSelect);
export default connect(mapStateToProps)(BaseGoalScreen);
