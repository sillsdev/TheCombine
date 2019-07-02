import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import {dropWord, WordDragAction} from "../../../components/DraggableWord/actions";
import {StoreState} from "../../../types";
import {MergeTreeAction, refreshWords} from "./actions";
import MergeDupStepComponent from "./component";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.mergeDuplicateGoal.wordDragState.draggedWord,
    words: state.mergeDuplicateGoal.mergeTreeState.tree.words,
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<
    StoreState,
    any,
    MergeTreeAction | WordDragAction 
  >
) {
  return {
    dropWord: () => {
      dispatch(dropWord());
    },
    refreshWords: () => {
      dispatch(refreshWords());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeDupStepComponent);
