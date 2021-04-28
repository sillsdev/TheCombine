import { connect } from "react-redux";

import { TraverseTreeAction } from "components/TreeView/TreeViewActions";
import TreeViewComponent from "components/TreeView/TreeViewComponent";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import SemanticDomainWithSubdomains from "types/SemanticDomain";

function mapStateToProps(state: StoreState) {
  return {
    currentDomain: state.treeViewState.currentDomain,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    navigateTree: (domain: SemanticDomainWithSubdomains) => {
      dispatch(TraverseTreeAction(domain));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeViewComponent);
