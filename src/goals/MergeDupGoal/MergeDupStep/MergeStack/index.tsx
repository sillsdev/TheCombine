import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import MergeStackComponent from "./component";
import { StoreState } from "../../../../types";
import { MergeTreeAction, addDuplicate, removeDuplicate } from "../actions";
import { Word } from "../../../../types/word";
import {
  WordDragAction,
  dropWord,
  dragWord
} from "../../../../components/DraggableWord/actions";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.mergeDuplicateGoal.wordDragState.draggedWord
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeTreeAction | WordDragAction>
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
