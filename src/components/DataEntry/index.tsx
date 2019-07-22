import DataEntryComponent from "./DataEntryComponent";
import { connect } from "react-redux";
import { StoreState } from "../../types";
import { getTranslate } from "react-localize-redux";

function mapStateToProps(state: StoreState) {
  return {
    translate: getTranslate(state.localize),
    domain: state.treeViewState.currentdomain
  };
}

export default connect(
  mapStateToProps,
  null
)(DataEntryComponent);
