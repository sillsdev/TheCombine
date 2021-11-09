import { connect } from "react-redux";

import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import { TraverseTreeAction } from "components/TreeView/TreeViewActions";
import TreeViewComponent from "components/TreeView/TreeViewComponent";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

function mapStateToProps(state: StoreState) {
  return {
    currentDomain: state.treeViewState.currentDomain,
    treeOpen: state.treeViewState.open,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    navigateTree: (domain: TreeSemanticDomain) => {
      dispatch(TraverseTreeAction(domain));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeViewComponent);
