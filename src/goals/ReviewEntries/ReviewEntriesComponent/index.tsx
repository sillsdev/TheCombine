import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import ReviewEntriesComponent from "./ReviewEntriesComponent";
import { ReviewEntriesWord } from "./ReviewEntriesTypes";
import {
  ReviewEntriesAction,
  updateAllWords,
  updateFrontierWord
} from "./ReviewEntriesActions";
import { StoreState } from "../../../types";

function mapStateToProps(state: StoreState) {
  return {
    language: state.reviewEntriesState.language,
    words: state.reviewEntriesState.words
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, ReviewEntriesAction>
) {
  return {
    updateAllWords: (words: ReviewEntriesWord[]) =>
      dispatch(updateAllWords(words)),
    updateFrontierWord: (
      newData: ReviewEntriesWord,
      oldData: ReviewEntriesWord,
      language: string
    ) => dispatch(updateFrontierWord(newData, oldData, language))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewEntriesComponent);
