import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../types";
import {
  MergeTreeAction,
  advanceStep,
  refreshWords,
  moveSenses,
  mergeAll,
  orderSense,
  orderDuplicate,
} from "./MergeDupStepActions";
import MergeDupStepComponent from "./MergeDupStepComponent";
import { MergeTreeReference } from "./MergeDupsTree";

export function mapStateToProps(state: StoreState) {
  return {
    words: state.mergeDuplicateGoal.tree.words,
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeTreeAction>
) {
  return {
    advanceStep: () => {
      dispatch(advanceStep());
    },
    refreshWords: () => {
      dispatch(refreshWords());
    },
    moveSenses: (src: MergeTreeReference[], dest: MergeTreeReference[]) => {
      dispatch(moveSenses(src, dest));
    },
    orderSense: (wordID: string, senseID: string, order: number) => {
      dispatch(orderSense(wordID, senseID, order));
    },
    orderDuplicate: (ref: MergeTreeReference, order: number) => {
      dispatch(orderDuplicate(ref, order));
    },
    mergeAll: () => {
      return dispatch(mergeAll());
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeDupStepComponent);
