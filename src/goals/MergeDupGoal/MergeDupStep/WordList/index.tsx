import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import WordListComponent from "./component";
import { StoreState } from "../../../../types";
import { WordDrag, dropWord, dragWord } from "../../../DraggableWord/actions";
import { Word } from "../../../../types/word";
import { addListWord, removeListWord, MergeAction } from "../actions";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.draggedWordState.draggedWord,
    words: state.mergeDupStepProps.words
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, WordDrag | MergeAction>
) {
  return {
    dragWord: (word: Word) => {
      dispatch(dragWord(word));
    },
    dropWord: () => {
      dispatch(dropWord());
    },
    addListWord: (word: Word) => {
      dispatch(addListWord(word));
    },
    removeListWord: (word: Word) => {
      dispatch(removeListWord(word));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WordListComponent);
