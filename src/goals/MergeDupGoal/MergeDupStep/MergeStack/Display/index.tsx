import { connect } from "react-redux";
import StackDisplayComponent from "./component";
import {
  dropWord,
  dragWord,
  WordDragAction
} from "../../../../../components/DraggableWord/actions";
import { Word } from "../../../../../types/word";
import { StoreState } from "../../../../../types";
import { ThunkDispatch } from "redux-thunk";
import {
  moveDuplicate,
  removeDuplicate,
  MergeTreeAction,
  addDuplicate
} from "../../actions";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.mergeDuplicateGoal.wordDragState.draggedWord
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeTreeAction | WordDragAction>
) {
  return {
    removeDuplicate: (word: Word, sense: number) => {
      dispatch(removeDuplicate(word, sense));
    },
    dropWord: () => {
      dispatch(dropWord());
    },
    dragWord: (word: Word) => {
      dispatch(dragWord(word));
    },
    addDuplicate: (word: Word, sense: number) => {
      dispatch(addDuplicate(word, sense));
    },
    moveWord: (word: Word, target: number) => {
      dispatch(moveDuplicate(word, target));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StackDisplayComponent);
