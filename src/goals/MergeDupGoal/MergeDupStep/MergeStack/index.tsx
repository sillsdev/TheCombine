import { connect } from "react-redux";

import { StoreState } from "../../../../types";
import MergeStackComponent from "./MergeStackComponent";

export function mapStateToProps(state: StoreState) {
  return {
    senses: state.mergeDuplicateGoal.data.senses,
  };
}

export default connect(mapStateToProps)(MergeStackComponent);
