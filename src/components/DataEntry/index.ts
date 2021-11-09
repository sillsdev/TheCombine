import { connect } from "react-redux";

import DataEntryComponent from "components/DataEntry/DataEntryComponent";
import {
  CloseTreeAction,
  OpenTreeAction,
} from "components/TreeView/TreeViewActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

function mapStateToProps(state: StoreState) {
  return {
    domain: state.treeViewState.currentDomain,
    treeIsOpen: state.treeViewState.open,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    closeTree: () => dispatch(CloseTreeAction()),
    openTree: () => dispatch(OpenTreeAction()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DataEntryComponent);
