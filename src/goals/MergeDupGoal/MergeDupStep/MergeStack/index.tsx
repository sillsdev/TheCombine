import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import MergeStackComponent from "./component";
import { StoreState } from "../../../../types";
import { WordDrag, dropWord, dragWord } from "../../../DraggableWord/actions";
import { MergeAction, addDuplicate, removeDuplicate } from "../actions";
import { Word } from "../../../../types/word";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.draggedWord.draggedWord
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeAction | WordDrag>
) {
  return {
    addDuplicate: (word: Word, sense: number) => {
      dispatch(addDuplicate(word, sense));
    },
    removeDuplicate: (word: Word, sense: number) => {
      dispatch(removeDuplicate(word, sense));
    },
    dropWord: () => {
      dispatch(dropWord());
    },
    dragWord: (word: Word) => {
      dispatch(dragWord(word));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeStackComponent);
