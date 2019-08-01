import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import {
  dropWord,
  WordDragAction
} from "../../../../components/DraggableWord/actions";
import { StoreState } from "../../../../types";
import { MergeTreeAction, setVern } from "../MergeDupStepActions";
import MergeRowComponent from "./MergeRowComponent";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.mergeDuplicateGoal.wordDragState.draggedWord,
    words: state.mergeDuplicateGoal.mergeTreeState.tree.words,
    data: state.mergeDuplicateGoal.mergeTreeState.data
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeTreeAction | WordDragAction>
) {
  return {
    dropWord: () => {
      dispatch(dropWord());
    },
    setVern: (wordID: string, vern: string) => {
      dispatch(setVern(wordID, vern));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeRowComponent);
