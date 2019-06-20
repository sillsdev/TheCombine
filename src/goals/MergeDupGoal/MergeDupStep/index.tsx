import { connect } from "react-redux";
import { StoreState } from "../../../types";
import MergeDupStepComponent from "./component";
import { ThunkDispatch } from "redux-thunk";
import { MergeTreeAction, applyMerges, addParent } from "./actions";
import { WordDrag, dropWord } from "../../DraggableWord/actions";
import { Word } from "../../../types/word";
import {
  addListWords,
  clearListWords,
  WordListAction,
  refreshListWords
} from "./WordList/actions";

export function mapStateToProps(state: StoreState) {
  return {
    parentWords: state.mergeDupStepProps.parentWords,
    draggedWord: state.draggedWordState.draggedWord,
    words: state.possibleDuplicateList.words
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<
    StoreState,
    any,
    MergeTreeAction | WordDrag | WordListAction
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
