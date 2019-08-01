import TreeViewComponent from "./TreeViewComponent";
import { StoreState } from "../../types";
import { connect } from "react-redux";
import { Dispatch } from "react";
import { TreeViewAction, TraverseTreeAction } from "./TreeViewActions";
import SemanticDomainWithSubdomains from "./SemanticDomain";

function mapStateToProps(state: StoreState) {
  return {
    currentDomain: state.treeViewState.currentdomain
  };
}

function mapDispatchToProps(dispatch: Dispatch<TreeViewAction>) {
  return {
    navigate: (domain: SemanticDomainWithSubdomains) => {
      dispatch(TraverseTreeAction(domain));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TreeViewComponent);
