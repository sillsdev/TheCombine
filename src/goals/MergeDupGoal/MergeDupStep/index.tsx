import { connect } from "react-redux";
import { StoreState } from "../../../types";
import MergeDupStepComponent from "./component";
import { ThunkDispatch } from "redux-thunk";
import {
  MergeAction,
  applyMerges,
  addParent,
  addListWord,
  clearListWords
} from "./actions";
import { WordDrag, dropWord } from "../../DraggableWord/actions";
import { Word } from "../../../types/word";

export function mapStateToProps(state: StoreState) {
  return {
    parentWords: state.mergeDupStepProps.parentWords,
    draggedWord: state.draggedWord.draggedWord,
    words: state.mergeDupStepProps.words
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeAction | WordDrag>
) {
  return {
    addParent: (word: Word) => {
      dispatch(addParent(word));
    },
    dropWord: () => {
      dispatch(dropWord());
    },
    clearMerges: () => {
      dispatch(applyMerges());
    },
    addListWord: (word: Word) => {
      dispatch(addListWord(word));
    },
    clearListWords: () => {
      dispatch(clearListWords());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeDupStepComponent);
