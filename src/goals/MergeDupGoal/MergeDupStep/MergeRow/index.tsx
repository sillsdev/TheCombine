import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import {
  dropWord,
  WordDragAction
} from "../../../../components/DraggableWord/actions";
import { StoreState } from "../../../../types";
import { MergeTreeAction, moveSense } from "../MergeDupStepActions";
import MergeRowComponent from "./MergeRowComponent";
import { MergeTreeReference } from "../MergeDupsTree";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.mergeDuplicateGoal.wordDragState.draggedWord,
    words: state.mergeDuplicateGoal.mergeTreeState.tree.words
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeTreeAction | WordDragAction>
) {
  return {
    dropWord: () => {
      dispatch(dropWord());
    },
    moveSense: (src: MergeTreeReference, dest: MergeTreeReference) => {
      dispatch(moveSense(src, dest));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeRowComponent);
