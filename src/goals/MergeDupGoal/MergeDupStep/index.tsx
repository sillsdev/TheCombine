import { connect } from "react-redux";
import { StoreState } from "../../../types";
import MergeDupStepComponent from "./component";
import { ThunkDispatch } from "redux-thunk";
import { MergeAction, addMerge, clearMerges } from "./actions";
import { WordDrag, dropWord } from "../../DraggableWord/actions";
import { Word } from "../../../types/word";

export function mapStateToProps(state: StoreState) {
  return {
    merges: state.mergeDupStepProps.merges,
    draggedWord: state.draggedWord.draggedWord
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeAction | WordDrag>
) {
  return {
    addMerge: (word: Word) => {
      dispatch(addMerge(word));
    },
    dropWord: () => {
      dispatch(dropWord());
    },
    clearMerges: () => {
      dispatch(clearMerges());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeDupStepComponent);
