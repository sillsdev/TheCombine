import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../../types";
import { MergeTreeAction, addSense } from "../actions";
import { Word } from "../../../../types/word";
import { dropWord, WordDrag } from "../../../DraggableWord/actions";
import MergeRowComponent from "./component";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.draggedWordState.draggedWord
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeTreeAction | WordDrag>
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
