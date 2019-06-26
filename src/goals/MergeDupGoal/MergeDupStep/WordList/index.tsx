import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import WordListComponent from "./component";
import { StoreState } from "../../../../types";
import { Word } from "../../../../types/word";
import { WordListAction, addListWords, removeListWords } from "./actions";
import {
  WordDragAction,
  dropWord,
  dragWord
} from "../../../../components/DraggableWord/actions";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.mergeDuplicateGoal.wordDragState.draggedWord,
    words: state.mergeDuplicateGoal.wordListState.words
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, WordDragAction | WordListAction>
) {
  return {
    dragWord: (word: Word) => {
      dispatch(dragWord(word));
    },
    dropWord: () => {
      dispatch(dropWord());
    },
    addListWord: (word: Word[]) => {
      dispatch(addListWords(word));
    },
    removeListWord: (word: Word[]) => {
      dispatch(removeListWords(word));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WordListComponent);
