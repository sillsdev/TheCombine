import { connect } from "react-redux";
import { StoreState } from "../../../types";
import MergeDupStepComponent from "./component";
import { ThunkDispatch } from "redux-thunk";
import { MergeTreeAction, applyMerges, addParent } from "./actions";
import {
  WordDragAction,
  dropWord
} from "../../../components/DraggableWord/actions";
import { Word } from "../../../types/word";
import {
  addListWords,
  clearListWords,
  WordListAction,
  refreshListWords
} from "./WordList/actions";

export function mapStateToProps(state: StoreState) {
  return {
    parentWords: state.mergeDuplicateGoal.mergeTreeState.parentWords,
    draggedWord: state.mergeDuplicateGoal.wordDragState.draggedWord,
    words: state.mergeDuplicateGoal.wordListState.words
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<
    StoreState,
    any,
    MergeTreeAction | WordDragAction | WordListAction
  >
) {
  return {
    addParent: (word: Word) => {
      dispatch(addParent(word));
    },
    dropWord: () => {
      dispatch(dropWord());
    },
    applyMerges: () => {
      dispatch(applyMerges());
    },
    addListWord: (word: Word[]) => {
      dispatch(addListWords(word));
    },
    clearListWords: () => {
      dispatch(clearListWords());
    },
    refreshListWords: () => {
      dispatch(refreshListWords());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeDupStepComponent);
