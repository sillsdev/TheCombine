import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import WordListComponent from "./component";
import { StoreState } from "../../../../types";
import { WordDrag, dropWord, dragWord } from "../../../DraggableWord/actions";
import { Word } from "../../../../types/word";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.draggedWord.draggedWord
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, WordDrag>
) {
  return {
    dragWord: (word: Word) => {
      dispatch(dragWord(word));
    },
    dropWord: () => {
      dispatch(dropWord());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WordListComponent);
