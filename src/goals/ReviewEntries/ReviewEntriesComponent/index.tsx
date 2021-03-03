import { connect } from "react-redux";

import {
  clearReviewEntriesState,
  updateAllWords,
  updateFrontierWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";
import ReviewEntriesComponent from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesComponent";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/actions";

function mapStateToProps(state: StoreState) {
  return {
    language: state.reviewEntriesState.analysisLanguage,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    clearState: () => dispatch(clearReviewEntriesState()),
    updateAllWords: (words: ReviewEntriesWord[]) =>
      dispatch(updateAllWords(words)),
    updateFrontierWord: (
      newData: ReviewEntriesWord,
      oldData: ReviewEntriesWord
    ) => dispatch(updateFrontierWord(newData, oldData)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewEntriesComponent);
