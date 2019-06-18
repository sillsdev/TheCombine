import { connect } from "react-redux";
import { StoreState } from "../../../types";
import MergeDupStepComponent from "./component";
import { ThunkDispatch } from "redux-thunk";
import {
  MergeAction,
  applyMerges,
  addParent,
  addListWord,
  clearListWords,
  sortWords
} from "./actions";
import { WordDrag, dropWord } from "../../DraggableWord/actions";
import { Word } from "../../../types/word";
import { SortStyle } from "../DupSorter/DupSorter";
import { changeSortStyle, SortAction } from "../DupSorter/actions";

export function mapStateToProps(state: StoreState) {
  return {
    parentWords: state.mergeDupStepProps.parentWords,
    draggedWord: state.draggedWordState.draggedWord,
    words: state.mergeDupStepProps.words,
    sortStyle: state.sortState.sortStyle
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeAction | WordDrag | SortAction>
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
    },
    switchSort: (newStyle: SortStyle) => {
      dispatch(changeSortStyle(newStyle));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeDupStepComponent);
