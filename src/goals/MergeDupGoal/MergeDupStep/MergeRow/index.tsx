import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../../types";
import { MergeTreeAction, addSense } from "../actions";
import { Word } from "../../../../types/word";
import {
  dropWord,
  WordDragAction
} from "../../../../components/DraggableWord/actions";
import MergeRowComponent from "./component";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.mergeDuplicateGoal.wordDragState.draggedWord
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeTreeAction | WordDragAction>
) {
  return {
    addSense: (word: Word, parent: number) => {
      dispatch(addSense(word, parent));
    },
    dropWord: () => {
      dispatch(dropWord());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeRowComponent);
