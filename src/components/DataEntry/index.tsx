import { connect } from "react-redux";

import DataEntryComponent from "components/DataEntry/DataEntryComponent";
import { StoreState } from "types";

function mapStateToProps(state: StoreState) {
  return {
    domain: state.treeViewState.currentDomain,
  };
}

export default connect(mapStateToProps, null)(DataEntryComponent);
