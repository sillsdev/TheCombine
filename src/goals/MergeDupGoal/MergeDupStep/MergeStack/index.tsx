import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import MergeStackComponent from "./MergeStackComponent";
import { StoreState } from "../../../../types";
import { MergeTreeAction } from "../MergeDupStepActions";

export function mapStateToProps(state: StoreState) {
  return {
    senses: state.mergeDuplicateGoal.mergeTreeState.data.senses,
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeTreeAction>
) {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeStackComponent);
