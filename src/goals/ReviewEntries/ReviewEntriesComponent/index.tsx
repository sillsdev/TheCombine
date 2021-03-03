import { connect } from "react-redux";

import {
  clearReviewEntriesState,
  updateAllWords,
  updateFrontierWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";
import ReviewEntriesComponent from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesComponent";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreStateDispatch } from "types/actions";

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

export default connect(null, mapDispatchToProps)(ReviewEntriesComponent);
