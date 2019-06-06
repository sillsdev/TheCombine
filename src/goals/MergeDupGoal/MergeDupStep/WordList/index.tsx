import WordList from "./component";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import WordListComponent from "./component";
import { StoreState } from "../../../../types";
import { WordDrag, dropWord, dragWord } from "../../../DraggableWord/actions";
import { Word } from "../../../../types/word";

//Temp Container Component

export function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, WordDrag>
) {
  return {
    dragWord: (word: Word) => {
      dispatch(dragWord(word));
    }
  };
}

export default connect(
  undefined,
  mapDispatchToProps
)(WordListComponent);
