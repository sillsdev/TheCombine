import { connect } from "react-redux";

import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";
import {
  clearReviewEntriesState,
  setAnalysisLang,
  updateAllWords,
  updateFrontierWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";
import ReviewEntriesComponent from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesComponent";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

function mapStateToProps(state: StoreState) {
  return {
    language: state.reviewEntriesState.analysisLanguage,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
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
