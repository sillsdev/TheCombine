import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import ViewFinalComponent, { ViewFinalWord } from "./ViewFinalComponent";
import {
  ViewFinalAction,
  updateAllWords,
  updateFrontierWord
} from "./ViewFinalActions";
import { StoreState } from "../../../types";

function mapStateToProps(state: StoreState) {
  return {
    language: state.viewFinalState.language,
    words: state.viewFinalState.words
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, ViewFinalAction>
) {
  return {
    updateAllWords: (words: ViewFinalWord[]) => dispatch(updateAllWords(words)),
    updateFrontierWord: (
      newData: ViewFinalWord,
      oldData: ViewFinalWord,
      language: string
    ) => dispatch(updateFrontierWord(newData, oldData, language))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewFinalComponent);
