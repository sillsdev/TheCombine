import { connect } from "react-redux";

import DataEntryComponent from "components/DataEntry/DataEntryComponent";
import {
  closeTreeAction,
  openTreeAction,
} from "components/TreeView/TreeViewActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

function mapStateToProps(state: StoreState) {
  return {
    currentDomainTree: state.treeViewState.currentDomain,
    treeIsOpen: state.treeViewState.open,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    closeTree: () => dispatch(closeTreeAction()),
    openTree: () => dispatch(openTreeAction()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataEntryComponent);
