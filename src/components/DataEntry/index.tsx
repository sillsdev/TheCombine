import DataEntryComponent from "./DataEntryComponent";
import { connect } from "react-redux";
import { StoreState } from "../../types";

function mapStateToProps(state: StoreState) {
  return {
    domain: state.treeViewState.currentDomain,
  };
}

export default connect(mapStateToProps, null)(DataEntryComponent);
