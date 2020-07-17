import TreeViewComponent from "./TreeViewComponent";
import { StoreState } from "../../types";
import { connect } from "react-redux";
import { Dispatch } from "react";
import { TreeViewAction, TraverseTreeAction } from "./TreeViewActions";
import SemanticDomainWithSubdomains from "../../types/SemanticDomain";

function mapStateToProps(state: StoreState) {
  return {
    currentDomain: state.treeViewState.currentDomain,
  };
}

function mapDispatchToProps(dispatch: Dispatch<TreeViewAction>) {
  return {
    navigateTree: (domain: SemanticDomainWithSubdomains) => {
      dispatch(TraverseTreeAction(domain));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeViewComponent);
