import { connect } from "react-redux";

import DomainCell from "./DomainCell";
import { StoreState } from "../../../../../types";

function mapStateToProps(state: StoreState) {
  return {
    selectedDomain: state.treeViewState.currentDomain,
  };
}

export default connect(mapStateToProps, null)(DomainCell);
