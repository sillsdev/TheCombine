import { connect } from "react-redux";

import { StoreState } from "types";
import DataEntryComponent from "components/DataEntry/DataEntryComponent";

function mapStateToProps(state: StoreState) {
  return {
    domain: state.treeViewState.currentDomain,
  };
}

export default connect(mapStateToProps, null)(DataEntryComponent);
