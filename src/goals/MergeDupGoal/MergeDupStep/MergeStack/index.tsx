import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import MergeStackComponent from "./component";
import { StoreState } from "../../../../types";
import { WordDrag, dropWord } from "../../../DraggableWord/actions";
import { MergeAction, addDuplicate } from "../actions";
import { Word } from "../../../../types/word";

//Temp Container Component

export function mapStateToProps(state: StoreState) {
  return {
    draggedWord: state.draggedWord.draggedWord
  };
}

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, MergeAction | WordDrag>
) {
  return {
    addDuplicate: (word: Word, parent: Word) => {
      dispatch(addDuplicate(word, parent));
    },
    dropWord: () => {
      dispatch(dropWord());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MergeStackComponent);
