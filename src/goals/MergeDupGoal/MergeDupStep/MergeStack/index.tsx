import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import MergeStackComponent from "./MergeStackComponent";
import { StoreState } from "../../../../types";
import { MergeTreeAction } from "../MergeDupStepActions";
import { MergeTreeReference } from "../MergeDupsTree";
import {
  WordDragAction,
  dropWord,
  dragWord
} from "../../../../components/DraggableWord/actions";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.mergeDuplicateGoal.wordDragState.draggedWord,
    senses: state.mergeDuplicateGoal.mergeTreeState.data.senses
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeTreeAction | WordDragAction>
) {
  return {
    dropWord: () => {
      dispatch(dropWord());
    },
    dragWord: (ref: MergeTreeReference) => {
      dispatch(dragWord(ref));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeStackComponent);
