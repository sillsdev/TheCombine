import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import WordListComponent from "./component";
import { StoreState } from "../../../../types";
import { WordDrag, dropWord, dragWord } from "../../../DraggableWord/actions";
import { Word } from "../../../../types/word";
import { WordListAction, addListWords, removeListWords } from "./actions";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.draggedWordState.draggedWord,
    words: state.possibleDuplicateList.words
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, WordDrag | WordListAction>
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
