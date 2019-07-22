import { connect } from "react-redux";

import NewSenseComponent from "./NewSenseComponent";
import { StoreState } from "../../../../types";

function mapStateToProps(state: StoreState) {
  return {
    treeViewsDomain: state.treeViewState.currentDomain
  };
}

export default connect(
  mapStateToProps,
  null
)(NewSenseComponent);
