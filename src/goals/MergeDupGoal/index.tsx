import { connect } from "react-redux";

import { StoreState } from "../../types";
import BaseGoalSelect from "../DefaultGoal/BaseGoalWidget/BaseGoalWidget";
import BaseGoalScreen from "../DefaultGoal/BaseGoalScreen/BaseGoalScreen";

//placeholder interfaces
export interface MergeDupData {}

export function mapStateToProps(state: StoreState) {
  return {};
}

export const Selector = connect(mapStateToProps)(BaseGoalSelect);
export default connect(mapStateToProps)(BaseGoalScreen);
