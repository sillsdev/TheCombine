import { connect } from "react-redux";

import { StoreState } from "../../types";
import { StoreStateDispatch } from "../../types/actions";
import SemanticDomainWithSubdomains from "../../types/SemanticDomain";
import { TraverseTreeAction } from "./TreeViewActions";
import TreeViewComponent from "./TreeViewComponent";

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
