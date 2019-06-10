import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../../types";
import { MergeAction, addSense } from "../actions";
import { Word } from "../../../../types/word";
import { dropWord, WordDrag } from "../../../DraggableWord/actions";
import MergeRowComponent from "./component";

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.draggedWord.draggedWord
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeAction | WordDrag>
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
