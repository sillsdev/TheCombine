import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import ReviewEntriesComponent from "./ReviewEntriesComponent";
import { ReviewEntriesWord } from "./ReviewEntriesTypes";
import {
  ReviewEntriesAction,
  updateAllWords,
  updateFrontierWord,
  clearReviewEntriesState,
  setAnalysisLang,
} from "./ReviewEntriesActions";
import { StoreState } from "../../../types";

function mapStateToProps(state: StoreState) {
  return {
    words: state.reviewEntriesState.words,
    language: state.reviewEntriesState.analysisLanguage,
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, ReviewEntriesAction>
) {
  return {
    clearState: () => dispatch(clearReviewEntriesState()),
    setAnalysisLanguage: () => dispatch(setAnalysisLang()),
    updateAllWords: (words: ReviewEntriesWord[]) =>
      dispatch(updateAllWords(words)),
    updateFrontierWord: (
      newData: ReviewEntriesWord,
      oldData: ReviewEntriesWord,
      language: string
    ) => dispatch(updateFrontierWord(newData, oldData, language)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewEntriesComponent);
