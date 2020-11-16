import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../../types";
import { MergeTreeAction, setVern } from "../MergeDupStepActions";
import MergeRowComponent from "./MergeRowComponent";

export function mapStateToProps(state: StoreState) {
  return {
    words: state.mergeDuplicateGoal.tree.words,
    data: state.mergeDuplicateGoal.data,
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeTreeAction>
) {
  return {
    setVern: (wordID: string, vern: string) => {
      dispatch(setVern(wordID, vern));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MergeRowComponent);
